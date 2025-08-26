import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations'
import { useAuth } from '@clerk/nextjs'

// Configuración de JWT template para Supabase
export const clerkSupabaseTemplate = 'supabase'

export const getSupabaseToken = async () => {
  const { getToken } = useAuth()
  return await getToken({ template: clerkSupabaseTemplate })
}

// Configuración de localización y tema personalizado
export const clerkConfig = {
  localization: esES,
  appearance: {
    baseTheme: undefined,
    variables: {
      colorPrimary: '#10B981', // Verde principal (ajusta según tu paleta)
      colorPrimaryText: '#FFFFFF',
      colorBackground: '#FFFFFF',
      colorInputBackground: '#F9FAFB',
      colorInputText: '#1F2937',
      colorText: '#1F2937',
      colorTextSecondary: '#6B7280',
      colorSuccess: '#10B981',
      colorDanger: '#EF4444',
      colorWarning: '#F59E0B',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif'
    },
    elements: {
      formButtonPrimary: {
        backgroundColor: '#10B981',
        '&:hover': {
          backgroundColor: '#059669'
        }
      },
      card: {
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      headerTitle: {
        color: '#1F2937',
        fontWeight: '600'
      },
      headerSubtitle: {
        color: '#6B7280'
      }
    }
  }
}

// Traducciones personalizadas adicionales
export const spanishTranslations = {
  signIn: {
    start: {
      title: 'Iniciar Sesión',
      subtitle: 'Bienvenido de vuelta a Confia Tour',
      actionText: '¿No tienes cuenta?',
      actionLink: 'Regístrate'
    }
  },
  signUp: {
    start: {
      title: 'Crear Cuenta',
      subtitle: 'Únete a Confia Tour',
      actionText: '¿Ya tienes cuenta?',
      actionLink: 'Iniciar sesión'
    }
  },
  userProfile: {
    start: {
      title: 'Mi Perfil',
      subtitle: 'Gestiona tu información personal'
    }
  }
}
