'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ProductStatus, type ProductDto } from '@rocket/shared';
import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImagesTab } from '@/features/products/components/images-tab';
import { InventoryTab } from '@/features/products/components/inventory-tab';
import { PricingTab } from '@/features/products/components/pricing-tab';
import { ShippingTab } from '@/features/products/components/shipping-tab';
import { TagInput } from '@/features/products/components/tag-input';
import {
  useCategories,
  useCreateProduct,
  useUpdateProduct,
} from '@/features/products/hooks';
import {
  NO_CATEGORY,
  productFormDefaults,
  productFormSchema,
  toCreateInput,
  toFormValues,
  type ProductFormValues,
} from '@/features/products/product-form-schema';
import { cn } from '@/lib/utils';

const TABS = ['Information', 'Images', 'Pricing', 'Inventory', 'Shipping'] as const;
type Tab = (typeof TABS)[number];

interface ProductFormModalProps {
  /** When provided, the modal edits this product (PATCH) instead of creating. */
  product?: ProductDto | null;
  /** Controlled open state (edit mode). Omit for the self-triggered create flow. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductFormModal({
  product,
  open: controlledOpen,
  onOpenChange,
}: ProductFormModalProps = {}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const isEdit = !!product;

  const [tab, setTab] = useState<Tab>('Information');
  const categoriesQuery = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const pending = createProduct.isPending || updateProduct.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  });

  function setOpen(v: boolean) {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  }

  // Load the product into the form each time the edit modal opens.
  useEffect(() => {
    if (open && product) {
      reset(toFormValues(product));
      setTab('Information');
    }
  }, [open, product, reset]);

  function close() {
    setOpen(false);
    setTab('Information');
    if (!isEdit) reset(productFormDefaults);
  }

  const onSubmit = handleSubmit((values) => {
    const input = toCreateInput(values);
    if (isEdit && product) {
      updateProduct.mutate({ id: product.id, input }, { onSuccess: close });
    } else {
      createProduct.mutate(input, { onSuccess: close });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Add Product
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-border px-6">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            {tab === 'Images' ? (
              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <ImagesTab value={field.value ?? []} onChange={field.onChange} />
                )}
              />
            ) : tab === 'Pricing' ? (
              <PricingTab
                register={register}
                control={control}
                watch={watch}
                setValue={setValue}
              />
            ) : tab === 'Inventory' ? (
              <InventoryTab
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            ) : tab === 'Shipping' ? (
              <ShippingTab register={register} />
            ) : tab === 'Information' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      placeholder="SKU-1001"
                      aria-invalid={!!errors.sku}
                      className={cn(errors.sku && 'border-danger focus-visible:ring-danger')}
                      {...register('sku')}
                    />
                    {errors.sku && (
                      <p className="text-xs text-danger">{errors.sku.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <div className="flex flex-col gap-1.5">
                    <Label>Status</Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ProductStatus.Available}>
                              Available
                            </SelectItem>
                            <SelectItem value={ProductStatus.Disabled}>
                              Disabled
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the product…"
                    {...register('description')}
                  />
                </div>

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
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="font-medium">{tab}</p>
                <p className="text-sm text-muted-foreground">
                  The {tab} tab is implemented in a later stage.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="gap-1.5">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
