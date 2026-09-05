export type LegalMediator = {
  name: string;
  address: string;
  website: string;
  phone: string;
};

export function getLegalHost() {
  return {
    name: process.env.LEGAL_HOST_NAME || "OVHcloud / OVH SAS",
    address: process.env.LEGAL_HOST_ADDRESS || "2 rue Kellermann, 59100 Roubaix, France",
    phone: process.env.LEGAL_HOST_PHONE || "+33 9 72 10 10 07",
    website: process.env.LEGAL_HOST_WEBSITE || "https://www.ovhcloud.com/",
  };
}

export function getLegalMediator(): LegalMediator | null {
  const name = process.env.LEGAL_MEDIATOR_NAME?.trim();
  const address = process.env.LEGAL_MEDIATOR_ADDRESS?.trim();
  const website = process.env.LEGAL_MEDIATOR_WEBSITE?.trim();
  const phone = process.env.LEGAL_MEDIATOR_PHONE?.trim();

  if (!name || !address || !website) return null;

  return { name, address, website, phone: phone || "" };
}
