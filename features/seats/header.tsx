import { PageHeader, PageTitle } from "../page-header/page-header";
import { DateFilter } from "./filters/date-filter";

interface HeaderProps {
  title: string;
  isDynamoDB?: boolean;
}

export const Header = ({ title, isDynamoDB }: HeaderProps) => {
  return (
    <PageHeader>
      <PageTitle>{title}</PageTitle>
      <div className="flex gap-8 justify-between flex-col md:flex-row">
        <div className="flex gap-2">
          <DateFilter disabled={!isDynamoDB} />
        </div>
      </div>
    </PageHeader>
  );
};
