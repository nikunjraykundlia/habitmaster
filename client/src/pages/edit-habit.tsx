import EditHabitForm from "@/components/habits/edit-habit-form";
import { useRoute } from "wouter";

export default function EditHabit() {
  // Get the habitId from the URL parameter
  const [match, params] = useRoute("/edit-habit/:id");
  const habitId = params?.id ? parseInt(params.id) : 0;

  return (
    <div className="container max-w-screen-lg mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Habit</h1>
      {habitId ? (
        <EditHabitForm habitId={habitId} />
      ) : (
        <div className="text-center py-10">
          <p className="text-neutral-600">Invalid habit ID. Please select a habit to edit.</p>
        </div>
      )}
    </div>
  );
}