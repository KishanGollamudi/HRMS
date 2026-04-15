import * as React from "react";
import { Controller, FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormField = ({ ...props }) => {
  return <Controller {...props} />;
};

const FormItem = ({ className, ...props }) => {
  return <div className={cn("space-y-2", className)} {...props} />;
};

const FormLabel = ({ className, ...props }) => {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
};

const FormControl = ({ ...props }) => {
  return <div {...props} />;
};

const FormMessage = ({ children }) => {
  if (!children) return null;
  return <p className="text-sm text-red-500">{children}</p>;
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
};