"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import QuestionCard from "./QuestionCard";

// 1. Update Schema 
export const questionSchema = z.object({
  title: z.string().min(1, "Question title is required"),
  description: z.string().optional(),
  type: z.enum([
    "short", "paragraph", "multiple", "checkboxes", "dropdown",
    "file", "linear", "multiple_grid", "checkbox_grid"
  ]),
  required: z.boolean(),
});

export const formBuilderSchema = z.object({
  formTitle: z.string().min(1, "Form title is required"),
  formDescription: z.string().optional(),
  questions: z.array(questionSchema),
});

export type FormBuilderValues = z.infer<typeof formBuilderSchema>;

export default function FormBuilderLogic() {
  const { register, control, handleSubmit } = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: {
      formTitle: "Event Registration Form",
      formDescription: "Please fill out the following information.",
      questions: [{ title: "Untitled Question", type: "multiple", required: false }],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = (data: FormBuilderValues) => console.log("Data:", data);

  return (
    <div className="bg-[#F0F4F9] min-h-screen p-8 flex justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[770px] flex flex-col gap-4">

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-[10px] border-t-[#3C7ACB] px-8 py-8">
          <input {...register("formTitle")} className="w-full text-[32px] text-gray-900 mb-2 focus:outline-none" />
          <input {...register("formDescription")} className="w-full text-[15px] text-gray-600 mt-2 focus:outline-none" />
        </div>

        {/* --- Question Card --- */}
        {fields.map((field, index) => (
          <QuestionCard
            key={field.id}
            index={index}
            control={control}
            register={register}
            remove={remove}
            insert={insert}
            currentField={field}
          />
        ))}

        {/* Floating Add Button */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => append({ title: "", type: "multiple", required: false })}
            className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>

      </form>
    </div>
  );
}