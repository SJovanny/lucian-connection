"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { PickupClosure, Profile, StoreSettings } from "@/types/database.types";

interface AdminSettingsFormProps {
  userId: string;
  initialEmail: string;
  initialFullName: string;
  initialPhone: string;
  initialDashboardLocale: string;
}

export function AdminSettingsForm({
  userId,
  initialEmail,
  initialFullName,
  initialPhone,
  initialDashboardLocale,
}: AdminSettingsFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [dashboardLocale, setDashboardLocale] = useState(initialDashboardLocale);
  const [preparationFee, setPreparationFee] = useState<string>("0");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [closures, setClosures] = useState<PickupClosure[]>([]);
  const [closedOn, setClosedOn] = useState("");
  const [closureReason, setClosureReason] = useState("");
  const [isSavingClosure, setIsSavingClosure] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("store_settings").select("preparation_fee").single();
      const typedSettings = data as Pick<StoreSettings, "preparation_fee"> | null;
      if (typedSettings) {
        setPreparationFee(typedSettings.preparation_fee.toString());
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    fetch("/api/admin/pickup-closures")
      .then((response) => response.json())
      .then((data) => setClosures(data.closures || []))
      .catch(() => setError("Impossible de charger les fermetures."));
  }, []);

  const handleAddClosure = async () => {
    if (!closedOn) return;
    setIsSavingClosure(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/pickup-closures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closed_on: closedOn, reason: closureReason }),
      });
      const data = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          INVALID_CLOSURE_DATE: "La date doit être un jour ouvré futur.",
          CLOSURE_HAS_SCHEDULED_ORDERS: "Des commandes sont déjà prévues à cette date.",
          CLOSURE_ALREADY_EXISTS: "Cette date est déjà fermée.",
        };
        throw new Error(messages[data.error] || "Impossible de créer la fermeture.");
      }
      setClosures((current) => [...current, data.closure].sort((a, b) => a.closed_on.localeCompare(b.closed_on)));
      setClosedOn("");
      setClosureReason("");
      setSuccess("Fermeture ajoutée.");
    } catch (closureError) {
      setError(closureError instanceof Error ? closureError.message : "Impossible de créer la fermeture.");
    } finally {
      setIsSavingClosure(false);
    }
  };

  const handleDeleteClosure = async (id: string) => {
    const response = await fetch(`/api/admin/pickup-closures/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Impossible de supprimer la fermeture.");
      return;
    }
    setClosures((current) => current.filter((closure) => closure.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const profileUpdate: Partial<Profile> = {
        full_name: fullName || null,
        phone: phone || null,
        dashboard_locale: dashboardLocale || "fr",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId);

      if (profileError) {

        setError(profileError.message);
        return;
      }

      // Update store settings
      const settingsUpdate: Partial<StoreSettings> = {
        preparation_fee: parseFloat(preparationFee),
        updated_at: new Date().toISOString(),
        updated_by: userId,
      };

      const { data: settingsData } = await supabase.from("store_settings").select("id").single();
      const settingsId = settingsData?.id;

      if (settingsId) {
        const { error: settingsError } = await supabase
          .from("store_settings")
          .update(settingsUpdate)
          .eq("id", settingsId);

        if (settingsError) {
          setError(settingsError.message);
          return;
        }
      } else {
        const { error: settingsError } = await supabase.from("store_settings").insert({
          preparation_fee: parseFloat(preparationFee),
          min_order_amount: 0,
          updated_by: userId,
        });

        if (settingsError) {
          setError(settingsError.message);
          return;
        }
      }

      if (email !== initialEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });

        if (emailError) {
          setError(emailError.message);
          return;
        }
      }

      setSuccess(
        email !== initialEmail
          ? "Profil mis à jour. Vérifiez votre email pour confirmer le changement d’adresse."
          : "Profil mis à jour."
      );
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="md" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          <p className="text-sm text-gray-500">
            Modifiez vos informations de compte administrateur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Votre nom"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+590 690 00 00 00"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Langue du dashboard
            </label>
            <select
              value={dashboardLocale}
              onChange={(e) => setDashboardLocale(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`text-sm rounded-lg px-4 py-3 ${error
                ? "bg-error-50 text-error-700 border border-error-200"
                : "bg-success-50 text-success-700 border border-success-200"
              }`}
          >
            {error || success}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving}>
            Enregistrer
          </Button>
        </div>
      </Card>

      <Card padding="md" className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fermetures exceptionnelles</h2>
          <p className="text-sm text-gray-500">Bloquez une journée de retrait. Les commandes déjà prévues doivent d&apos;abord être reprogrammées.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <Input label="Date" type="date" value={closedOn} onChange={(e) => setClosedOn(e.target.value)} required />
          <Input label="Motif interne (facultatif)" value={closureReason} onChange={(e) => setClosureReason(e.target.value)} placeholder="Jour férié" />
          <Button onClick={handleAddClosure} isLoading={isSavingClosure} disabled={!closedOn}>Ajouter</Button>
        </div>
        {closures.length > 0 ? (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {closures.map((closure) => (
              <li key={closure.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{closure.closed_on}</p>
                  {closure.reason && <p className="text-sm text-gray-500">{closure.reason}</p>}
                </div>
                <button type="button" onClick={() => handleDeleteClosure(closure.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Supprimer</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Aucune fermeture future.</p>
        )}
      </Card>

      <Card padding="md" className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Paramètres de la boutique</h2>
          <p className="text-sm text-gray-500">
            Configuration générale du magasin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Frais de préparation"
            type="number"
            value={preparationFee}
            onChange={(e) => setPreparationFee(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            helperText="Montant ajouté au total de chaque commande (Click & Collect)."
          />
        </div>
      </Card>

      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Note sur l’email
        </h3>
        <p className="text-sm text-gray-500">
          Un changement d’adresse email nécessite une confirmation. Vous recevrez
          un message de validation.
        </p>
      </Card>
    </div>
  );
}
