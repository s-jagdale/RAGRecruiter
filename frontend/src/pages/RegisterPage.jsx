import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";
import Input from "../components/Input";
import Button from "../components/Button";

// Mirrors the backend's own validation: password >= 6 chars (main.py /auth/register).
const schema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success("Account created — let's get you interview-ready.");
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      toast.error(err.message || "Could not create your account.");
    }
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">Create your account</h1>
      <p className="mt-2 text-center text-sm text-ink-500">Start practicing in under a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <Input label="Username" placeholder="Jane Doe" error={errors.username?.message} {...register("username")} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
