"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
<<<<<<< HEAD
=======
import type { Profile, StoreSettings } from "@/types/database.types";
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1

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

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
<<<<<<< HEAD
      const { data } = await (supabase.from("store_settings") as any)
        .select("preparation_fee")
        .single();
      if (data) {
        setPreparationFee(data.preparation_fee.toString());
=======
      const { data } = await supabase.from("store_settings").select("preparation_fee").single();
      const typedSettings = data as Pick<StoreSettings, "preparation_fee"> | null;
      if (typedSettings) {
        setPreparationFee(typedSettings.preparation_fee.toString());
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

<<<<<<< HEAD
      const { error: profileError } = await (supabase.from("profiles") as any)
        .update({
          full_name: fullName || null,
          phone: phone || null,
          dashboard_locale: dashboardLocale || "fr",
        })
=======
      const profileUpdate: Partial<Profile> = {
        full_name: fullName || null,
        phone: phone || null,
        dashboard_locale: dashboardLocale || "fr",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
        .eq("id", userId);

      if (profileError) {

        setError(profileError.message);
        return;
      }

      // Update store settings
<<<<<<< HEAD
      const { data: storeSettings } = await (supabase.from("store_settings") as any)
        .select("id")
        .single();

      const { error: settingsError } = await (supabase.from("store_settings") as any)
        .update({
          preparation_fee: parseFloat(preparationFee),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("id", storeSettings?.id);

      // Fail-safe if single row doesn't exist (though migration creates it)
      if (settingsError) {
        // Try insert if update fails (though unique index exists)
        await (supabase.from("store_settings") as any).insert({
          preparation_fee: parseFloat(preparationFee),
=======
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
      } else {
        await supabase.from("store_settings").insert({
          preparation_fee: parseFloat(preparationFee),
          min_order_amount: 0,
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
          updated_by: userId,
        });
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
