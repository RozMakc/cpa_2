import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from "@/Layouts/GuestLayout";
import SignInForm from "./components/SignInForm";

export default function SignIn() {
  return (
    <GuestLayout>
        <Head title="Sign In" />
        <SignInForm />
    </GuestLayout>
  );
}