import { WebpayPlus, Environment } from "transbank-sdk";

class TransbankWebpayPlus {
    constructor() {
        this.commerceCode = process.env.WEBPAY_COMMERCE_CODE || '597055555532'; // Webpay Plus
        this.apiKeySecret = process.env.WEBPAY_API_KEY_SECRET || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
        this.baseUrl = process.env.WEBPAY_BASE_URL || 'https://webpay3gint.transbank.cl';
    }

    // Crear transacción
    async createTransaction(amount, buyOrder, returnUrl, sessionId = null) {
        try {
            const finalSessionId = sessionId || this.generateSessionId();
            
            const requestBody = {
                buy_order: buyOrder,
                session_id: finalSessionId,
                amount: amount,
                return_url: returnUrl
            };

            console.log('Request body:', requestBody);

            const response = await fetch(`${this.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Tbk-Api-Key-Id': this.commerceCode,
                    'Tbk-Api-Key-Secret': this.apiKeySecret
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            const data = await response.json();
            
            return {
                token: data.token,
                url: data.url,
                buyOrder: buyOrder,
                sessionId: finalSessionId,
                amount: amount,
                returnUrl: returnUrl
            };
        } catch (error) {
            throw new Error(`Error creating transaction: ${error.message}`);
        }
    }

    // Confirmar transacción
    async confirmTransaction(token) {
        try {
            console.log('🏦 Transbank: Confirmando transacción con token:', token)
            
            const response = await fetch(`${this.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`, {
                method: 'PUT',
                headers: {
                    'Tbk-Api-Key-Id': this.commerceCode,
                    'Tbk-Api-Key-Secret': this.apiKeySecret,
                    'Content-Type': 'application/json'
                }
            })
            
            console.log('📡 Transbank: Response status:', response.status)
            
            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Transbank: Error response:', errorText)
                throw new Error(`Error confirming transaction: ${response.status} - ${errorText}`)
            }

            const data = await response.json()
            console.log('✅ Transbank: Confirmación exitosa:', data)
            return data
        } catch (error) {
            console.error('💥 Transbank: Error en confirmTransaction:', error)
            throw error
        }
    }

    // Obtener estado de transacción
    async getTransactionStatus(token) {
        try {
            const response = await fetch(`${this.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Tbk-Api-Key-Id': this.commerceCode,
                    'Tbk-Api-Key-Secret': this.apiKeySecret
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Error getting transaction status: ${error.message}`);
        }
    }

    // Refund de transacción
    async refundTransaction(token, amount) {
        try {
            const response = await fetch(`${this.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}/refunds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Tbk-Api-Key-Id': this.commerceCode,
                    'Tbk-Api-Key-Secret': this.apiKeySecret
                },
                body: JSON.stringify({ amount: amount })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Error refunding transaction: ${error.message}`);
        }
    }

    // Generar número de orden único - Revisar en donde se utiliza
    generateBuyOrder() {
        // Transbank requiere que buy_order sea alfanumérico, máximo 26 caracteres
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `ORD${timestamp.slice(-10)}${random}`.substring(0, 26);
    }

    // Generar ID de sesión único (CORREGIDO)
    generateSessionId() {
        // session_id debe ser alfanumérico, máximo 61 caracteres
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 8).toUpperCase();
        return `SES${timestamp}${random}`.substring(0, 61);
    }

    // Validar parámetros antes de enviar
    validateTransactionParams(amount, buyOrder, returnUrl, sessionId) {
        const errors = [];

        // Validar monto
        if (!amount || amount <= 0) {
            errors.push('El monto debe ser mayor a 0');
        }
        if (amount > 999999999) {
            errors.push('El monto no puede ser mayor a 999,999,999');
        }

        // Validar buy_order
        if (!buyOrder) {
            errors.push('buy_order es requerido');
        } else {
            if (buyOrder.length > 26) {
                errors.push('buy_order no puede tener más de 26 caracteres');
            }
            if (!/^[a-zA-Z0-9]+$/.test(buyOrder)) {
                errors.push('buy_order solo puede contener caracteres alfanuméricos');
            }
        }

        // Validar return_url
        if (!returnUrl) {
            errors.push('return_url es requerido');
        } else {
            try {
                new URL(returnUrl);
            } catch {
                errors.push('return_url debe ser una URL válida');
            }
        }

        // Validar session_id
        if (sessionId) {
            if (sessionId.length > 61) {
                errors.push('session_id no puede tener más de 61 caracteres');
            }
            if (!/^[a-zA-Z0-9]+$/.test(sessionId)) {
                errors.push('session_id solo puede contener caracteres alfanuméricos');
            }
        }

        return errors;
    }

    // Validar respuesta de retorno desde Transbank
    validateResponse(responseData) {
        const requiredFields = ['token_ws'];
        
        for (const field of requiredFields) {
            if (!responseData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        return true;
    }

    // Parsear respuesta de estado de transacción
    parseTransactionStatus(status) {
        const statusMap = {
            'AUTHORIZED': 'Autorizada',
            'FAILED': 'Fallida',
            'NULLIFIED': 'Anulada',
            'PARTIALLY_NULLIFIED': 'Parcialmente Anulada',
            'CAPTURED': 'Capturada'
        };

        return {
            status: status.status,
            statusDescription: statusMap[status.status] || 'Estado desconocido',
            amount: status.amount,
            authorizationCode: status.authorization_code,
            paymentTypeCode: status.payment_type_code,
            responseCode: status.response_code,
            installmentsAmount: status.installments_amount,
            installmentsNumber: status.installments_number,
            balance: status.balance,
            cardDetail: status.card_detail,
            accountingDate: status.accounting_date,
            transactionDate: status.transaction_date,
            vci: status.vci,
            buyOrder: status.buy_order,
            sessionId: status.session_id
        };
    }

    // Configuraciones estáticas para otros productos de Transbank - Revisar en donde se usa y si entra en conflico con las credenciales dinámicas del constructor
    static getCredentials() {
        return {
            webpayPlus: {
                commerceCode: '597055555532',
                apiKeySecret: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
            }
        };
    }
}

export { TransbankWebpayPlus };