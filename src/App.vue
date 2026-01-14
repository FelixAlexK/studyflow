<script setup lang="ts">
import { ref } from "vue";
import { useConvexQuery } from "convex-vue";
import { api } from "../convex/_generated/api";
import { useSession, signIn, signOut, signUp } from "./lib/auth-client";

const session = useSession();
const {data: tasks} = useConvexQuery(api.tasks.getTaskList);

const email = ref('test@example.com');
const password = ref('Password123!'); // Stronger password
const name = ref('Test User');

const handleSignUp = async () => {
  try {
    console.log('Signing up with:', { email: email.value, password: password.value, name: name.value });
    const result = await signUp.email({ 
      email: email.value, 
      password: password.value,
      name: name.value
    });
    console.log('Sign up result:', result);
  } catch (error) {
    console.error('Sign up error:', error);
  }
};

const handleSignIn = async () => {
  try {
    console.log('Signing in with:', { email: email.value, password: password.value });
    const result = await signIn.email({ 
      email: email.value, 
      password: password.value
    });
    console.log('Sign in result:', result);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};

const handleSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
</script>

<template>
  <div>
    <div v-if="session.data">
      <p>Welcome, {{ session.data.user.email }}</p>
      <button @click="handleSignOut">Sign Out</button>
      <ul>
        <li v-for="task in tasks" :key="task._id">{{ task.text }}</li>
      </ul>
    </div>
    <div v-else>
      <div>
        <input v-model="email" placeholder="Email" type="email" />
        <input v-model="password" placeholder="Password" type="password" />
        <input v-model="name" placeholder="Name" type="text" />
      </div>
      <button @click="handleSignUp">Sign Up</button>
      <button @click="handleSignIn">Sign In</button>
    </div>
  </div>
</template>