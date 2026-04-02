import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
          <svg viewBox="0 0 32 32" fill="white" className="w-9 h-9">
            <path d="M8 6h16a2 2 0 012 2v4H6V8a2 2 0 012-2zM6 14h20v10a2 2 0 01-2 2H8a2 2 0 01-2-2V14zm4 3a1 1 0 000 2h8a1 1 0 000-2H10zm0 4a1 1 0 000 2h4a1 1 0 000-2h-4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Dalley Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
