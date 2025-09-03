import {
    MercadoPagoConfig,
    Preference,
} from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_TOKEN,
    options: { timeout: 5000, idempotencyKey: "abc" },
});

const pref = new Preference(client);

export async function createSingleProductPreference(options) {
    return pref.create({
        body: {
            items: [
                {
                    id: options.productId,
                    title: options.productName,
                    description: options.productDescription,
                    unit_price: Number(options.productPrice),
                    quantity: 1,
                    currency_id: "CLP",
                },
            ],
            payer: {
                email: options.userEmail,
            },
        },
    });
}
