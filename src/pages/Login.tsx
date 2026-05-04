import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Mail, Lock, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

type Tab = 'login' | 'register' | 'magic'

interface FormData {
  email: string
  password: string
  confirmPassword: string
}

export function Login() {
  const { t } = useTranslation()
  const { user, signInWithPassword, signInWithMagicLink, signUp, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>()

  if (!loading && user) return <Navigate to="/" replace />

  const onLogin = async (data: FormData) => {
    setError(null)
    const err = await signInWithPassword(data.email, data.password)
    if (err) setError(err)
  }

  const onRegister = async (data: FormData) => {
    setError(null)
    if (data.password !== data.confirmPassword) {
      setError(t('auth.error_password_mismatch'))
      return
    }
    const err = await signUp(data.email, data.password)
    if (err) setError(err)
  }

  const onMagicLink = async (data: FormData) => {
    setError(null)
    const err = await signInWithMagicLink(data.email)
    if (err) setError(err)
    else setMagicSent(true)
  }

  const switchTab = (newTab: Tab) => {
    setTab(newTab)
    setError(null)
    setMagicSent(false)
    reset()
  }

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'login',    icon: <LogIn size={15} />,    label: t('auth.tab_login') },
    { key: 'register', icon: <UserPlus size={15} />, label: t('auth.tab_register') },
    { key: 'magic',    icon: <Sparkles size={15} />, label: t('auth.tab_magic') },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-6xl">🍌</div>
          <h1 className="text-2xl font-bold text-gray-900">{t('app.name')}</h1>
          <p className="text-sm text-gray-500">{t('app.tagline')}</p>
        </div>

        <Card padding="lg">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            {tabs.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  tab === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Erreur globale */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* === CONNEXION === */}
          {tab === 'login' && (
            <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
              <Input
                label={t('auth.email')}
                type="email"
                prefix={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email', { required: t('validation.requis') })}
              />
              <Input
                label={t('auth.password')}
                type="password"
                prefix={<Lock size={15} />}
                error={errors.password?.message}
                {...register('password', { required: t('validation.requis') })}
              />
              <Button type="submit" fullWidth size="lg" loading={isSubmitting} icon={<LogIn size={18} />}>
                {t('auth.btn_login')}
              </Button>
            </form>
          )}

          {/* === INSCRIPTION === */}
          {tab === 'register' && (
            <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <Input
                label={t('auth.email')}
                type="email"
                prefix={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email', { required: t('validation.requis') })}
              />
              <Input
                label={t('auth.password')}
                type="password"
                prefix={<Lock size={15} />}
                error={errors.password?.message}
                hint={t('auth.password_hint')}
                {...register('password', {
                  required: t('validation.requis'),
                  minLength: { value: 6, message: t('auth.error_password_short') },
                })}
              />
              <Input
                label={t('auth.confirm_password')}
                type="password"
                prefix={<Lock size={15} />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: t('validation.requis'),
                  validate: v => v === watch('password') || t('auth.error_password_mismatch'),
                })}
              />
              <Button type="submit" fullWidth size="lg" loading={isSubmitting} icon={<UserPlus size={18} />}>
                {t('auth.btn_register')}
              </Button>
              <p className="text-xs text-gray-400 text-center">{t('auth.register_confirm_email')}</p>
            </form>
          )}

          {/* === LIEN MAGIQUE === */}
          {tab === 'magic' && (
            <>
              {magicSent ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle2 size={48} className="text-primary-500" />
                  <p className="font-bold text-gray-800">{t('auth.magic_sent_title')}</p>
                  <p className="text-sm text-gray-500">{t('auth.magic_sent_desc')}</p>
                  <Button variant="ghost" size="sm" onClick={() => setMagicSent(false)}>
                    {t('auth.magic_retry')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onMagicLink)} className="space-y-4">
                  <p className="text-sm text-gray-500">{t('auth.magic_desc')}</p>
                  <Input
                    label={t('auth.email')}
                    type="email"
                    prefix={<Mail size={15} />}
                    error={errors.email?.message}
                    {...register('email', { required: t('validation.requis') })}
                  />
                  <Button type="submit" fullWidth size="lg" loading={isSubmitting} icon={<Sparkles size={18} />}>
                    {t('auth.btn_magic')}
                  </Button>
                </form>
              )}
            </>
          )}
        </Card>

        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
