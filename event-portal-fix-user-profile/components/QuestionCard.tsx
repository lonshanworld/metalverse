"use client";

import { useWatch, Control, UseFormRegister, useFieldArray } from "react-hook-form";
import { GripVertical, Copy, Trash2, Circle, Square, UploadCloud, Grid3X3, X, ChevronDown, AlignLeft, AlignJustify, Upload, CircleDot, ChevronDownSquare, CheckSquare, MoreHorizontal, LayoutGrid, Plus, ImageIcon } from "lucide-react";

import * as z from "zod";
import { useState, useRef } from "react";

type GridItem = { value: string };

// Question schema
export const questionSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  type: z.enum([
    "short", "paragraph", "multiple", "checkboxes", "dropdown",
    "file", "linear", "multiple_grid", "checkbox_grid"
  ]),
  required: z.boolean(),
  // Array for choices
  options: z.array(z.object({ value: z.string() })).optional(),

  rows: z.array(z.object({ value: z.string() })).optional(),
  columns: z.array(z.object({ value: z.string() })).optional(),

  linearMin: z.number().optional(),
  linearMax: z.number().optional(),
  linearMinLabel: z.string().optional(),
  linearMaxLabel: z.string().optional(),
  
  // Field to store the image preview URL
  imagePreview: z.string().optional(),
});

// Main form schema
export const formBuilderSchema = z.object({
  formTitle: z.string().min(1, "Required"),
  formDescription: z.string().optional(),
  questions: z.array(questionSchema),
});

export type FormBuilderValues = z.infer<typeof formBuilderSchema>;

interface QuestionCardProps {
  index: number;
  control: Control<FormBuilderValues>;
  register: UseFormRegister<FormBuilderValues>;
  remove: (index: number) => void;
  insert: (index: number, value: FormBuilderValues["questions"][number]) => void;
  currentField: FormBuilderValues["questions"][number];
}

export default function QuestionCard({ index, control, register, remove, insert, currentField }: QuestionCardProps) {

  // Watch active type
  const questionType = useWatch({
    control,
    name: `questions.${index}.type` as const,
    defaultValue: currentField.type,
  });

  // Watch options for real-time dropdown preview
  const watchOptions = useWatch({
    control,
    name: `questions.${index}.options` as `questions.${number}.options`
  }) || [];
  
  // States for UI
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSelection, setPreviewSelection] = useState("");
  
  // States and refs for Image Upload feature
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(currentField.imagePreview || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch linear scale values for dynamic preview
  const linearMin = useWatch({ control, name: `questions.${index}.linearMin` }) as number | undefined;
  const linearMax = useWatch({ control, name: `questions.${index}.linearMax` }) as number | undefined;

  // Watch Labels
  const linearMinLabel = useWatch({ control, name: `questions.${index}.linearMinLabel` }) as string | undefined;
  const linearMaxLabel = useWatch({ control, name: `questions.${index}.linearMaxLabel` }) as string | undefined;

  const minVal = Number(linearMin ?? 1);
  const maxVal = Number(linearMax ?? 5);

  // Manage nested options
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray<FormBuilderValues>({
    control,
    name: `questions.${index}.options`,
  });

  // Manage Rows
  const { fields: rowFields, append: appendRow, remove: removeRow } = useFieldArray<FormBuilderValues>({
    control,
    name: `questions.${index}.rows`,
  });

  // Manage Columns
  const { fields: colFields, append: appendCol, remove: removeCol } = useFieldArray<FormBuilderValues>({
    control,
    name: `questions.${index}.columns`,
  });

  // Watch for real-time preview updates on Grids
  const watchRows = useWatch<FormBuilderValues>({ control, name: `questions.${index}.rows` }) as GridItem[] || [];
  const watchCols = useWatch<FormBuilderValues>({ control, name: `questions.${index}.columns` }) as GridItem[] || [];

  // Handler for image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for the selected file to display as a preview
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      
      // Note: If you plan to submit this to a backend, you might need to register this file object 
      // into react-hook-form using setValue() depending on your API requirements.
    }
  };

  // Handler to clear the uploaded image
  const removeImage = () => {
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value so the same file can be selected again
    }
  };

  // Render choice item for multiple choice, checkboxes, and dropdowns
  const renderOptionItem = (type: "multiple" | "checkboxes" | "dropdown", optIndex: number, fieldId: string) => (
    <div key={fieldId} className="flex items-center gap-3 group">

      {/* 1. Icon */}
      {type === "multiple" && <Circle size={18} className="text-gray-300 flex-shrink-0" />}
      {type === "checkboxes" && <Square size={18} className="text-gray-300 flex-shrink-0" />}
      {type === "dropdown" && <span className="text-sm text-gray-400 w-[18px] text-center">{optIndex + 1}.</span>}

      {/* 2. Input  */}
      <input
        {...register(`questions.${index}.options.${optIndex}.value` as const)}
        placeholder={`Option ${optIndex + 1}`}
        className="text-[14px] text-gray-800 focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-[#3C7ACB] w-full pb-1 transition-colors bg-transparent"
      />

      {/* 3. Delete button */}
      {optionFields.length > 1 && (
        <button
          type="button"
          onClick={() => removeOption(optIndex)}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove option"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );

  // Render dynamic UI based on the selected question type
  const renderInputArea = () => {
    switch (questionType) {
      case "short":
        return (
          <div className="w-1/2 mb-3">
            {/* Short input field */}
            <p className="border-b border-dashed border-gray-300 pb-1 text-sm text-gray-400">Short answer text</p>
          </div>
        );

      case "paragraph":
        return (
          <div className="w-full mb-6">
            <p className="border-b border-dashed border-gray-300 pb-1 text-sm text-gray-400">Long answer text</p>
          </div>
        );
      case "multiple":
        return (
          <div className="mb-6 flex flex-col gap-3">
            {optionFields.map((opt, i) => renderOptionItem("multiple", i, opt.id))}

            <div className="flex items-center gap-3 mt-1">
              <Plus size={18} className="text-[#3C7ACB] flex-shrink-0" />
              <button
                type="button"
                onClick={() => appendOption({ value: `Option ${optionFields.length + 1}` })}
                className="text-[14px] text-[#3C7ACB] hover:text-gray-800 border-b border-transparent hover:border-gray-300 pb-[1px] transition-colors"
              >
                Add option
              </button>
            </div>
          </div>
        );

      case "checkboxes":
        return (
          <div className="mb-6 flex flex-col gap-3">
            {optionFields.map((opt, i) => renderOptionItem("checkboxes", i, opt.id))}

            <div className="flex items-center gap-3 mt-1">
              <Plus size={18} className="text-[#3C7ACB] flex-shrink-0" />
              <button
                type="button"
                onClick={() => appendOption({ value: `Option ${optionFields.length + 1}` })}
                className="text-[14px] text-[#3C7ACB] hover:text-gray-800 border-b border-transparent hover:border-gray-300 pb-[1px] transition-colors"
              >
                Add option
              </button>
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div className="mb-6 flex flex-col gap-3">
            {/* 1. Options list */}
            {optionFields.map((opt, i) => renderOptionItem("dropdown", i, opt.id))}

            {/* 2. Add option button  */}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-[18px] flex justify-center">
                <Plus size={18} className="text-[#3C7ACB] flex-shrink-0" />
              </div>
              <button
                type="button"
                onClick={() => appendOption({ value: `Option ${optionFields.length + 1}` })}
                className="text-[14px] text-[#3C7ACB] hover:text-gray-800 border-b border-transparent hover:border-gray-300 pb-[1px] transition-colors"
              >
                Add option
              </button>
            </div>

            {/* 3. Preview Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[13px] text-gray-500 mb-3">Preview</p>

              <div className="relative inline-block min-w-[150px]">

                {/* Trigger Button */}
                <div
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="flex items-center justify-between w-full bg-gradient-to-b from-white to-gray-50 border border-gray-300 shadow-sm rounded px-3 py-1.5 cursor-pointer hover:border-gray-400 transition-colors select-none"
                >
                  <span className={`text-[14px] ${previewSelection ? "text-gray-900" : "text-gray-600"}`}>
                    {previewSelection || "Choose"}
                  </span>
                  <div className="ml-4 flex flex-col items-center pointer-events-none">
                    <svg className="w-[10px] h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>

                {/* (Dropdown List) */}
                {isPreviewOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50 max-h-[200px] overflow-y-auto">
                    {/* Clear Selection */}
                    <div
                      onClick={() => { setPreviewSelection(""); setIsPreviewOpen(false); }}
                      className="px-3 py-2 text-[14px] text-gray-400 hover:bg-gray-50 cursor-pointer italic"
                    >
                      Clear selection
                    </div>

                    {/* Dropdown Real-time Options */}
                    {watchOptions.map((opt: { value: string }, idx: number) => {
                      const displayValue = opt.value || `Option ${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          onClick={() => { setPreviewSelection(displayValue); setIsPreviewOpen(false); }}
                          className={`px-3 py-2 text-[14px] cursor-pointer transition-colors ${previewSelection === displayValue ? "bg-[#EEF5FC] text-[#3C7ACB] font-medium" : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {displayValue}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          </div>
        );

      case "file":
        return (
          <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <UploadCloud size={36} className="mb-2" />
            <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, GIF, MP4 up to 10MB</p>
          </div>
        );

      case "linear":
        return (
          <div className="mb-6 flex flex-col">

            {/* 1. Min / Max Selectors */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[14px] font-semibold text-gray-700">From</span>
              <div className="relative">
                <select
                  {...register(`questions.${index}.linearMin`, { valueAsNumber: true })}
                  defaultValue={1}
                  className="appearance-none bg-gradient-to-b from-white to-gray-50 border border-gray-300 rounded px-3 py-1.5 pr-8 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#3C7ACB] cursor-pointer shadow-sm"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              <span className="text-[14px] font-semibold text-gray-700">To</span>
              <div className="relative">
                <select
                  {...register(`questions.${index}.linearMax`, { valueAsNumber: true })}
                  defaultValue={5}
                  className="appearance-none bg-gradient-to-b from-white to-gray-50 border border-gray-300 rounded px-3 py-1.5 pr-8 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#3C7ACB] cursor-pointer shadow-sm"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* 2. Min / Max Labels */}
            <div className="flex gap-4 mb-6">
              <input
                {...register(`questions.${index}.linearMinLabel`)}
                placeholder="Label for minimum (optional)"
                className="flex-1 text-[14px] text-gray-700 bg-transparent border border-gray-200 rounded-md p-3 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3C7ACB] focus:border-[#3C7ACB] transition-colors"
              />
              <input
                {...register(`questions.${index}.linearMaxLabel`)}
                placeholder="Label for maximum (optional)"
                className="flex-1 text-[14px] text-gray-700 bg-transparent border border-gray-200 rounded-md p-3 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3C7ACB] focus:border-[#3C7ACB] transition-colors"
              />
            </div>

            {/* 3. Preview Section (Dynamic Range + Labels) */}
            <div className="mt-2 pt-5 border-t border-gray-100">
              <p className="text-[13px] text-gray-500 mb-5">Preview</p>

              <div className="flex items-center gap-6">

                {/* Min Label */}
                {linearMinLabel && typeof linearMinLabel === "string" && (
                  <span className="text-[14px] text-gray-700 pb-7">{linearMinLabel}</span>
                )}

                {/* Circles */}
                <div className="flex items-center gap-6 flex-wrap">
                  {Array.from({ length: (maxVal - minVal) + 1 }, (_, i) => minVal + i).map((num) => (
                    <div key={num} className="flex flex-col items-center gap-2.5">
                      <Circle size={22} className="text-gray-400 stroke-[1.5]" />
                      <span className="text-[13px] text-gray-600 font-medium">{num}</span>
                    </div>
                  ))}
                </div>

                {/* Max Label */}
                {linearMaxLabel && typeof linearMaxLabel === "string" && (
                  <span className="text-[14px] text-gray-700 pb-7">{linearMaxLabel}</span>
                )}

              </div>
            </div>
          </div>
        );
      case "multiple_grid":
      case "checkbox_grid":
        const isCheckboxGrid = questionType === "checkbox_grid";
        const GridIcon = isCheckboxGrid ? Square : Circle;

        return (
          <div className="mb-6 flex flex-col">

            {/* 1. Setup Section (Rows & Columns side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">

              {/* Rows Setup */}
              <div>
                <p className="text-[14px] font-medium text-gray-700 mb-3">Rows</p>
                <div className="flex flex-col gap-3">
                  {rowFields.map((row, rIdx) => (
                    <div key={row.id} className="flex items-center gap-3 group">
                      <span className="text-sm text-gray-400 w-[18px] text-center">{rIdx + 1}.</span>
                      <input
                        {...register(`questions.${index}.rows.${rIdx}.value`)}
                        placeholder={`Row ${rIdx + 1}`}
                        className="text-[14px] text-gray-800 bg-transparent focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-[#3C7ACB] w-full pb-1 transition-colors"
                      />
                      {rowFields.length > 1 && (
                        <button type="button" onClick={() => removeRow(rIdx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add row Button */}
                  <div className="flex items-center gap-3 ">
                    <div className="w-[18px] flex justify-center mb-1">
                      <Plus size={18} className="text-[#3C7ACB] flex-shrink-0" />
                    </div>
                    <button
                      type="button"
                      onClick={() => appendRow({ value: `Row ${rowFields.length + 1}` })}
                      className="text-[14px] text-[#3C7ACB] hover:text-gray-800 border-b border-transparent hover:border-gray-300 pb-[1px] transition-colors text-left"
                    >
                      Add row
                    </button>
                  </div>
                </div>
              </div>

              {/* Columns Setup */}
              <div>
                <p className="text-[14px] font-medium text-gray-700 mb-3">Columns</p>
                <div className="flex flex-col gap-3">
                  {colFields.map((col, cIdx) => (
                    <div key={col.id} className="flex items-center gap-3 group">
                      <span className="text-sm text-gray-400 w-[18px] text-center">{cIdx + 1}.</span>
                      <input
                        {...register(`questions.${index}.columns.${cIdx}.value`)}
                        placeholder={`Column ${cIdx + 1}`}
                        className="text-[14px] text-gray-800 bg-transparent focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-[#3C7ACB] w-full pb-1 transition-colors"
                      />
                      {colFields.length > 1 && (
                        <button type="button" onClick={() => removeCol(cIdx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add column Button */}
                  <div className="flex items-center gap-3">
                    <div className="w-[18px] flex justify-center mb-1">
                      <Plus size={18} className="text-[#3C7ACB] flex-shrink-0" />
                    </div>
                    <button
                      type="button"
                      onClick={() => appendCol({ value: `Column ${colFields.length + 1}` })}
                      className="text-[14px] text-[#3C7ACB] hover:text-gray-800 border-b border-transparent hover:border-gray-300 pb-[1px] transition-colors text-left"
                    >
                      Add column
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Preview Section */}
            <div className="mt-4 pt-5 border-t border-gray-100 overflow-x-auto">
              <p className="text-[13px] text-gray-500 mb-4">Preview</p>
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr>
                    <th className="p-3 border-b border-gray-300 w-1/4"></th>
                    {watchCols.map((col: GridItem, cIdx: number) => (
                      <th key={cIdx} className="p-3 text-center text-[14px] font-medium text-gray-800 border-b border-gray-300 min-w-[80px]">
                        {col.value || `Column ${cIdx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {watchRows.map((row: GridItem, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 text-[14px] text-gray-700 border-b border-gray-100 break-words">
                        {row.value || `Row ${rIdx + 1}`}
                      </td>
                      {watchCols.map((_, cIdx: number) => (
                        <td key={cIdx} className="p-3 text-center border-b border-gray-100">
                          <GridIcon size={20} className="text-gray-300 mx-auto stroke-[1.5]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex relative focus-within:ring-2 focus-within:ring-[#3C7ACB]/20 transition-all group">

      {/* Drag handle */}
      <div className="pt-6 w-10 flex justify-center cursor-grab text-gray-300 hover:text-gray-500">
        <GripVertical size={20} />
      </div>

      <div className="flex-1 pr-6 pb-4 pt-6">

        {/* Title & Type Header */}
        <div className="flex items-start gap-4 mb-4">

          {/* Left Side: Title & Description */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Main Question Input (Gray Background) */}
            <div className="bg-gray-50/80 border-b border-gray-400 focus-within:border-[#3C7ACB] focus-within:border-b-2 transition-colors rounded-t-sm">
              <input
                {...register(`questions.${index}.title` as const)}
                placeholder="Question"
                className="w-full bg-transparent text-base text-gray-900 px-4 py-3.5 focus:outline-none"
              />
            </div>

            {/* Description Input (Optional, placed below like standard forms) */}
            <input
              {...register(`questions.${index}.description` as const)}
              placeholder="Description (optional)"
              className="w-full text-[13px] text-gray-500 bg-transparent focus:outline-none border-b border-transparent hover:border-gray-200 focus:border-[#3C7ACB] pb-1 transition-colors"
            />
          </div>

          {/* Hidden File Input for Image Upload */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
          
          {/* Image Icon Button (Outside the gray block, aligned top) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-md transition-colors flex-shrink-0"
            title="Add Image to Question"
          >
            <ImageIcon size={22} strokeWidth={1.5} />
          </button>

          {/* Right Side: Type Dropdown */}
          <div className="relative w-[230px] flex-shrink-0">
            {/* 1. Dynamic Icon  */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {(() => {
                switch (questionType) {
                  case "short": return <AlignLeft size={20} />;
                  case "paragraph": return <AlignJustify size={20} />;
                  case "multiple": return <CircleDot size={20} />;
                  case "checkboxes": return <CheckSquare size={20} />;
                  case "dropdown": return <ChevronDownSquare size={20} />;
                  case "file": return <Upload size={20} />;
                  case "linear": return <MoreHorizontal size={20} />;
                  case "multiple_grid": return <LayoutGrid size={20} />;
                  case "checkbox_grid": return <Grid3X3 size={20} />;
                  default: return <CircleDot size={20} />;
                }
              })()}
            </div>

            {/* 2. Native Select */}
            <select
              {...register(`questions.${index}.type` as const)}
              className="w-full bg-white border border-gray-300 rounded-md pl-12 pr-10 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#3C7ACB] focus:border-[#3C7ACB] text-gray-700 text-[14px] font-medium cursor-pointer transition-colors"
            >
              <optgroup label="Text">
                <option value="short">Short Answer</option>
                <option value="paragraph">Paragraph</option>
              </optgroup>
              <optgroup label="Choices">
                <option value="multiple">Multiple Choice</option>
                <option value="checkboxes">Checkboxes</option>
                <option value="dropdown">Dropdown</option>
              </optgroup>
              <optgroup label="Advanced">
                <option value="file">File Upload</option>
                <option value="linear">Linear Scale</option>
                <option value="multiple_grid">Multiple Choice Grid</option>
                <option value="checkbox_grid">Checkbox Grid</option>
              </optgroup>
            </select>

            {/* 3. Dropdown Arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Display Image Preview if an image is uploaded */}
        {imagePreviewUrl && (
          <div className="relative inline-block mb-6 group/img ml-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagePreviewUrl} 
              alt="Question Preview" 
              className="max-w-[500px] w-full h-auto rounded-lg border border-gray-200"
            />
            <button 
              onClick={removeImage}
              type="button"
              className="absolute top-2 right-2 bg-white rounded-md p-1.5 shadow-sm border border-gray-200 text-gray-500 hover:text-red-500 opacity-0 group-hover/img:opacity-100 transition-opacity"
              title="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Dynamic content for answers */}
        {renderInputArea()}

        {/* Footer actions */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => insert(index + 1, { ...currentField })}
            className="p-2 text-gray-500 hover:bg-[#EEF5FC] hover:text-[#3C7ACB] rounded-md transition-colors tooltip"
          >
            <Copy size={20} />
          </button>
          <button
            type="button"
            onClick={() => remove(index)}
            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors tooltip"
          >
            <Trash2 size={20} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <label className="flex items-center gap-2 text-[14px] font-medium text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register(`questions.${index}.required` as const)}
              className="w-4 h-4 accent-[#3C7ACB] focus:ring-[#3C7ACB] rounded border-gray-300"
            />
            Required
          </label>
        </div>

      </div>
    </div>
  );
}