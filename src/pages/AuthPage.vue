<script setup lang="ts">
    import { signIn, signUp } from "../lib/auth-client";
import { ref } from 'vue';
import { Button } from "@/components/ui/button";
import { useRouter } from "vue-router";

const router = useRouter();

    const email = ref("test@example.com");
const password = ref("Password123!"); // Stronger password
const name = ref("Test User");
    const handleSignUp = async () => {
	try {
		console.log("Signing up with:", {
			email: email.value,
			password: password.value,
			name: name.value,
		});
		const result = await signUp.email({
			email: email.value,
			password: password.value,
			name: name.value,
		});
		console.log("Sign up result:", result);
	} catch (error) {
		console.error("Sign up error:", error);
	}
};

const handleSignIn = async () => {
	try {
		console.log("Signing in with:", {
			email: email.value,
			password: password.value,
		});
		const result = await signIn.email({
			email: email.value,
			password: password.value,
		});
    router.push(`/dashboards/${result.data?.user?.name}`);
		console.log("Sign in result:", result);
	} catch (error) {
		console.error("Sign in error:", error);
	}
};
</script>

<template>
    <div  class="flex min-h-screen items-center justify-center bg-muted/50">
    <div class="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg">
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-bold">StudyFlow</h1>
        <p class="text-muted-foreground">Sign in to your account or create a new one</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            placeholder="email@example.com"
            type="email"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            placeholder="••••••••"
            type="password"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium" for="name">Name (for sign up)</label>
          <input
            id="name"
            v-model="name"
            placeholder="Your Name"
            type="text"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div class="flex gap-3">
        <Button class="flex-1" @click="handleSignIn">
          Sign In
        </Button>
        <Button class="flex-1" variant="outline" @click="handleSignUp">
          Sign Up
        </Button>
      </div>
    </div>
  </div>
</template>