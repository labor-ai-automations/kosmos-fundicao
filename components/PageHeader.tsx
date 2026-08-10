interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string;
}

export function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumb && <p className="kosmos-page-breadcrumb">{breadcrumb}</p>}
      <h2 className="kosmos-page-title">{title}</h2>
      {description && (
        <p className="kosmos-page-description">{description}</p>
      )}
    </div>
  );
}
