// ── Utility ───────────────────────────────────────────────────────────────────
export { cn } from "./utils";

// ── Button ────────────────────────────────────────────────────────────────────
export { Button, buttonVariants } from "./Button";
export type { ButtonProps } from "./Button";

// ── SmartButton ───────────────────────────────────────────────────────────────
export { SmartButton } from "./SmartButton";
export type { SmartButtonProps, SmartButtonStatus } from "./SmartButton";

// ── Badge ─────────────────────────────────────────────────────────────────────
export { Badge, badgeVariants } from "./Badge";
export type { BadgeProps } from "./Badge";

// ── Alert ─────────────────────────────────────────────────────────────────────
export { Alert } from "./Alert";
export type { AlertProps } from "./Alert";

// ── Input ─────────────────────────────────────────────────────────────────────
export { Input } from "./Input";
export type { InputProps } from "./Input";

// ── Select ────────────────────────────────────────────────────────────────────
export { NativeSelect, CustomSelect } from "./Select";
export type { SelectOption } from "./Select";

// ── Textarea ──────────────────────────────────────────────────────────────────
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

// ── Card ──────────────────────────────────────────────────────────────────────
export { Card, CardImage, CardHeader, CardBody, CardFooter } from "./Card";
export type { CardProps } from "./Card";

// ── Skeleton ──────────────────────────────────────────────────────────────────
export {
  SkeletonProvider,
  Skeleton,
  SkeletonFade,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonChart,
  SkeletonForm,
} from "./Skeleton";
export type {
  SkeletonAnimation,
  SkeletonSpeed,
  SkeletonProviderProps,
  SkeletonProps,
  SkeletonFadeProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonCardProps,
  SkeletonTableProps,
  SkeletonListProps,
  SkeletonChartProps,
  SkeletonFormProps,
} from "./Skeleton";

// ── Modal ─────────────────────────────────────────────────────────────────────
export { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
export type { ModalProps } from "./Modal";

// ── ToastManager ──────────────────────────────────────────────────────────────
export { ToastProvider, useToast } from "./ToastManager";
export type {
  ToastType,
  ToastAction,
  ToastOptions,
  ToastEntry,
  ToastProviderProps,
  UseToastReturn,
} from "./ToastManager";

// ── Tabs ──────────────────────────────────────────────────────────────────────
export { Tabs } from "./Tabs";
export type { TabsProps, TabItem } from "./Tabs";

// ── Accordion ─────────────────────────────────────────────────────────────────
export { Accordion } from "./Accordion";
export type { AccordionProps, AccordionItem } from "./Accordion";

// ── Tooltip ───────────────────────────────────────────────────────────────────
export { Tooltip } from "./Tooltip";
export type { TooltipProps, TooltipPlacement } from "./Tooltip";

// ── DropdownMenu ──────────────────────────────────────────────────────────────
export { DropdownMenu } from "./DropdownMenu";
export type { DropdownMenuProps, DropdownMenuItem, DropdownPlacement } from "./DropdownMenu";

// ── ProgressBar ───────────────────────────────────────────────────────────────
export { ProgressBar, CircularProgress } from "./ProgressBar";

// ── Mobile form components ────────────────────────────────────────────────────
export { MobileInput } from "./MobileInput";
export type { MobileInputProps } from "./MobileInput";

export { MobileSelect, MobileMultiSelect } from "./MobileSelect";
export type { MobileSelectProps, MobileMultiSelectProps, MobileSelectOption } from "./MobileSelect";

export { MobileFileUpload } from "./MobileFileUpload";
export type { MobileFileUploadProps, FilePreview } from "./MobileFileUpload";

export { MobileDatePicker } from "./MobileDatePicker";
export type { MobileDatePickerProps, QuickPreset } from "./MobileDatePicker";

// ── OptimizedImage ───────────────────────────────────────────────────────────
export { OptimizedImage } from "./OptimizedImage";
export type { OptimizedImageProps, AspectRatio, ResponsiveSizeContext } from "./OptimizedImage";

// ── Trust Signals ─────────────────────────────────────────────────────────────
export { SSLBadge, PaymentSecurityIcons, VerificationBadge, VerificationBadgeGroup, DataProtectionNotice } from "./TrustSignals";
export type { SSLBadgeProps, PaymentSecurityIconsProps, VerificationBadgeProps, VerificationBadgeGroupProps, VerificationKind, DataProtectionNoticeProps } from "./TrustSignals";

// ── Form validation hook ──────────────────────────────────────────────────────
export { useFormValidation, validators, scrollToFirstError } from "./useFormValidation";
export type { FieldValidator, FieldState, ValidationSchema, UseFormValidationReturn } from "./useFormValidation";
export type { ProgressBarProps, CircularProgressProps } from "./ProgressBar";
