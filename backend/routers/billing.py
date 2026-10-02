from fastapi import APIRouter, Depends, HTTPException
import httpx
import stripe
import os
from core.deps import get_current_user
from models.models import User

router = APIRouter(tags=["Billing"])

@router.post("/{billing_id}/notify/whatsapp")
async def send_whatsapp_billing_notify(
    billing_id: str,
    current_user: User = Depends(get_current_user)
):
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    try:
        # Create a product and price for 5 BRL
        product = stripe.Product.create(name=f"Faturamento {billing_id[:6]} - Orbe/INHO")
        price = stripe.Price.create(unit_amount=500, currency="brl", product=product.id)
        payment_link = stripe.PaymentLink.create(line_items=[{"price": price.id, "quantity": 1}])
        checkout_url = payment_link.url
        
        # Dispatch to WhatsApp via Baileys 
        phone = "5551984743957"
        message = (
            f"Orbrick>Inho>{current_user.full_name} = Olá Juliana, segue a cobrança de R$ 5,00 da área de pagamentos. "
            "Você pode pagar diretamente via PIX abrindo o link seguro oficial do gateway:\n"
            f"{checkout_url}\n\n"
            "Obrigado por utilizar INHO Sistemas (Orbe Prod)."
        )
        
        baileys_url = "http://52.20.22.241:3001/send"
        async with httpx.AsyncClient() as client:
            resp = await client.post(baileys_url, json={"phone": phone, "message": message}, timeout=15.0)
            if resp.status_code != 200:
                print("Erro no Baileys:", resp.text)
                
        return {"status": "success", "whatsapp_url": checkout_url}
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e.user_message or e.error.message))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
