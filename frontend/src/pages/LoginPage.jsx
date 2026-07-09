import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";
import Input from "../components/Input";
import Button from "../components/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    }
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-ink-500">Log in to continue practicing.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{" "}
        <Link to={ROUTES.REGISTER} className="font-semibold text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
