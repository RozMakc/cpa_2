import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from "@/Layouts/GuestLayout";
import SignUpForm from './components/SignUpForm';

export default function SignIn() {
  return (
    <GuestLayout>
        <Head title="Sign Up" />
        <SignUpForm/>
    </GuestLayout>
  );
}