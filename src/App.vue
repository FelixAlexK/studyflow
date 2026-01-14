<script setup lang="ts">
import { useConvexQuery, useConvexMutation } from "convex-vue";
import { api } from "../convex/_generated/api";

const { data, isPending } = useConvexQuery(api.tasks.getTaskList);
const createTask = useConvexMutation(api.tasks.createTask);

const createTaskHandler = async () => {
  const text = prompt("Enter task text:");
  if (text) {
    await createTask.mutate({ text });
  }
};
</script>

<template>
  <button @click="createTaskHandler">Add Task</button>
  <span v-if="isPending"> Loading... </span>
  <ul v-else>
    <li v-for="todo in data">
      {{ todo.text }} {{ todo.isCompleted ? "☑" : "☐" }}
    </li>
  </ul>
</template>