import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAxiosError } from 'axios'

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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="w-full max-w-md border-2 border-black shadow-[4px_4px_0px_#000] bg-white p-8">
        <h1 className="text-3xl font-black mb-1">Finance Tracker</h1>
        <p className="text-sm font-bold mb-6 text-gray-600">Buat akun baru</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="block font-bold mb-1" htmlFor="name">Nama</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full border-2 border-black px-3 py-2 focus:outline-none focus:shadow-[2px_2px_0px_#000]"
              placeholder="Nama lengkap"
            />
            {errors.name && (
              <p className="text-[#EF4444] text-sm mt-1 font-bold">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full border-2 border-black px-3 py-2 focus:outline-none focus:shadow-[2px_2px_0px_#000]"
              placeholder="email@contoh.com"
            />
            {errors.email && (
              <p className="text-[#EF4444] text-sm mt-1 font-bold">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full border-2 border-black px-3 py-2 focus:outline-none focus:shadow-[2px_2px_0px_#000]"
              placeholder="Minimal 8 karakter"
            />
            {errors.password && (
              <p className="text-[#EF4444] text-sm mt-1 font-bold">{errors.password.message}</p>
            )}
          </div>

          {apiError && (
            <p className="text-[#EF4444] text-sm mb-4 font-bold border-2 border-[#EF4444] px-3 py-2">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isRegisterLoading}
            className="w-full bg-[#FACC15] border-2 border-black font-black py-2 shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRegisterLoading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-black underline hover:text-[#FACC15]">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
