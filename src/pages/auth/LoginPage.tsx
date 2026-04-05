import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAxiosError } from 'axios'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, isLoginLoading, loginError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => login(data)

  const apiError =
    loginError && isAxiosError(loginError)
      ? (loginError.response?.data as { error?: string })?.error ?? 'Login gagal'
      : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-neo p-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-3xl font-black mb-1">Finance Tracker</h1>
          <p className="text-sm font-bold mb-6 text-gray-600">Masuk ke akun Anda</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@contoh.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {apiError && (
              <p className="text-danger text-sm font-bold border-neo-thick border-danger px-3 py-2">
                {apiError}
              </p>
            )}

            <Button type="submit" variant="primary" loading={isLoginLoading} className="w-full mt-2">
              Masuk
            </Button>
          </form>

          <p className="mt-4 text-sm text-center">
            Belum punya akun?{' '}
            <Link to="/register" className="font-black underline hover:text-primary">
              Daftar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
