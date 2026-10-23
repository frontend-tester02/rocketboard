'use client';

import type { PublicUser } from '@rocket/shared';
import { Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePassword, useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks';

interface ProfileForm {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  location: string;
  birthday: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SettingsTab({ user }: { user: PublicUser }) {
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();
  const avatarInput = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      birthday: user.birthday ? user.birthday.slice(0, 10) : '',
    },
  });

  useEffect(() => {
    profileForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      birthday: user.birthday ? user.birthday.slice(0, 10) : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSaveProfile = profileForm.handleSubmit((v) => {
    updateProfile.mutate({
      firstName: v.firstName,
      lastName: v.lastName,
      jobTitle: v.jobTitle || undefined,
      phone: v.phone || undefined,
      location: v.location || undefined,
      birthday: v.birthday ? new Date(v.birthday) : undefined,
    });
  });

  const onChangePassword = passwordForm.handleSubmit((v) => {
    changePassword.mutate(
      { currentPassword: v.currentPassword, newPassword: v.newPassword },
      { onSuccess: () => passwordForm.reset() },
    );
  });

  const newPassword = passwordForm.watch('newPassword');

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <section className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Profile photo</h3>
        <div className="flex items-center gap-4">
          <UserAvatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} className="size-16" />
          <div>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => avatarInput.current?.click()}
              disabled={uploadAvatar.isPending}
            >
              <Upload className="size-4" />
              {uploadAvatar.isPending ? 'Uploading…' : 'Change photo'}
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">JPG or PNG, up to a few MB.</p>
            <input
              ref={avatarInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar.mutate(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </section>

      {/* Profile fields */}
      <form onSubmit={onSaveProfile} className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Personal information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" error={profileForm.formState.errors.firstName?.message}>
            <Input {...profileForm.register('firstName', { required: 'First name is required' })} />
          </Field>
          <Field label="Last name" error={profileForm.formState.errors.lastName?.message}>
            <Input {...profileForm.register('lastName', { required: 'Last name is required' })} />
          </Field>
          <Field label="Job title">
            <Input {...profileForm.register('jobTitle')} placeholder="Product Designer" />
          </Field>
          <Field label="Phone">
            <Input {...profileForm.register('phone')} placeholder="+1 555 000 1234" />
          </Field>
          <Field label="Location">
            <Input {...profileForm.register('location')} placeholder="City, Country" />
          </Field>
          <Field label="Birthday">
            <Input type="date" {...profileForm.register('birthday')} />
          </Field>
          <Field label="Email">
            <Input value={user.email} disabled />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={onChangePassword} className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Change password</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current password" error={passwordForm.formState.errors.currentPassword?.message}>
            <Input
              type="password"
              {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
            />
          </Field>
          <div className="hidden sm:block" />
          <Field label="New password" error={passwordForm.formState.errors.newPassword?.message}>
            <Input
              type="password"
              {...passwordForm.register('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
          </Field>
          <Field label="Confirm new password" error={passwordForm.formState.errors.confirmPassword?.message}>
            <Input
              type="password"
              {...passwordForm.register('confirmPassword', {
                validate: (v) => v === newPassword || 'Passwords do not match',
              })}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" variant="outline" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
