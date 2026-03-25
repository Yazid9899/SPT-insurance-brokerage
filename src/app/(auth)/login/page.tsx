"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { loginSchema } from "@/lib/validations";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
      return;
    }

    setError("Invalid credentials");
  };

  return (
    <form className="w-full max-w-sm space-y-4 rounded bg-white p-6 shadow" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">CargoShield Login</h1>
      <label className="block text-sm font-medium">
        Email
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        className="w-full rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
        type="submit"
        disabled={formState.isSubmitting}
      >
        Sign in
      </button>
    </form>
  );
}
