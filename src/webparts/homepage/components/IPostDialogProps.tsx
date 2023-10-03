export interface IPostDialogProps {
    onSave: (header: string, content: string, author: string) => Promise<void>;
    onClose: () => Promise<void>;
}