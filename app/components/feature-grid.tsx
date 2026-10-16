import "./marketing.css";

interface FeatureItem {
  title: string;
  body: string;
}

interface FeatureGridProps {
  items: FeatureItem[];
}

export const FeatureGrid = ({ items }: FeatureGridProps) => (
  <ul className="feature-grid">
    {items.map((item) => (
      <li key={item.title} className="feature-card">
        <h3 className="feature-card__title">{item.title}</h3>
        <p className="feature-card__body">{item.body}</p>
      </li>
    ))}
  </ul>
);
