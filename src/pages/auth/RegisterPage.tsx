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
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser, isRegisterLoading, registerError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => registerUser(data)

  const apiError =
    registerError && isAxiosError(registerError)
      ? (registerError.response?.data as { error?: string })?.error ?? 'Registrasi gagal'
      : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-neo p-4">
      <div className="w-full max-w-md">
        <Card>
          <h1 className="text-3xl font-black mb-1">Finance Tracker</h1>
          <p className="text-sm font-bold mb-6 text-gray-600">Buat akun baru</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Nama"
              type="text"
              placeholder="Nama lengkap"
              error={errors.name?.message}
              {...register('name')}
            />

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
              placeholder="Minimal 8 karakter"
              error={errors.password?.message}
              {...register('password')}
            />

            {apiError && (
              <p className="text-danger text-sm font-bold border-neo-thick border-danger px-3 py-2">
                {apiError}
              </p>
            )}

            <Button type="submit" variant="primary" loading={isRegisterLoading} className="w-full mt-2">
              Daftar
            </Button>
          </form>

          <p className="mt-4 text-sm text-center">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-black underline hover:text-primary">
              Masuk
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
