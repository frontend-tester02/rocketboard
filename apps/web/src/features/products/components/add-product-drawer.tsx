'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/features/products/components/tag-input';
import { useCategories, useCreateProduct } from '@/features/products/hooks';
import { cn } from '@/lib/utils';

const NO_CATEGORY = '__none__';

const schema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(160),
  description: z.string().trim().max(5000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
type FormValues = z.input<typeof schema>;

function generateSku(): string {
  return `SKU-${Date.now().toString(36).toUpperCase()}`;
}

export function AddProductDrawer() {
  const [open, setOpen] = useState(false);
  const categoriesQuery = useCategories();
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', category: NO_CATEGORY, tags: [] },
  });

  const onSubmit = handleSubmit((values) => {
    createProduct.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        category:
          values.category && values.category !== NO_CATEGORY
            ? values.category
            : undefined,
        tags: values.tags ?? [],
        sku: generateSku(),
        price: 0,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <SheetTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Add Product
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>Add Product</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Wireless Headphones"
                aria-invalid={!!errors.name}
                className={cn(errors.name && 'border-danger focus-visible:ring-danger')}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe the product…"
                {...register('description')}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                      {categoriesQuery.data?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <Label>Tags</Label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagInput value={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProduct.isPending} className="gap-1.5">
              {createProduct.isPending && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
