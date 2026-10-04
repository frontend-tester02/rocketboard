import type { Schema } from 'mongoose';

/**
 * Global Mongoose plugin applied to every schema via the connection factory
 * (see `app.module.ts`). It enables `timestamps` and normalizes serialized
 * output: `_id` → `id`, and drops `__v`. Applied to both `toJSON` and
 * `toObject` so documents serialize consistently everywhere.
 */
export function baseSchemaPlugin(schema: Schema): void {
  schema.set('timestamps', true);

  const transform = (
    _doc: unknown,
    ret: Record<string, unknown>,
  ): Record<string, unknown> => {
    if (ret._id != null) {
      ret.id = String(ret._id);
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  };

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform,
  });
  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform,
  });
}
