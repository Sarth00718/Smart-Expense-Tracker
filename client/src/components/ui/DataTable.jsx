import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './shadcn/table';
import { Button } from './shadcn/button';
import { Input } from './shadcn/input';
import EmptyState from './EmptyState';
import SkeletonLoader from './SkeletonLoader';

/**
 * DataTable - Standardized data table component
 * Supports searching, sorting, pagination, empty states, and loading skeletons.
 */
export default function DataTable({ 
  columns, 
  data, 
  searchKey = '', 
  searchPlaceholder = 'Search...', 
  loading = false, 
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyIcon,
  onExport,
  itemsPerPage = 10 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Search
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter(item => {
      const val = item[searchKey];
      if (!val) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="table" lines={5} />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {searchKey && (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        )}
        {onExport && (
          <Button variant="outline" size="sm" icon={FileDown} onClick={onExport} className="w-full sm:w-auto">
            Export
          </Button>
        )}
      </div>

      {/* Table Area */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead 
                  key={col.key || i} 
                  className={`whitespace-nowrap ${col.className || ''}`}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-foreground transition-colors outline-none"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={row._id || row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className || ''}>
                      {col.cell ? col.cell(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <EmptyState 
                    icon={emptyIcon} 
                    title={emptyTitle} 
                    description={emptyDescription} 
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
