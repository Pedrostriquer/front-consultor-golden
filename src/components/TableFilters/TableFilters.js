import React from 'react';
import './TableFilters.css';

const TableFilters = ({ filters, setFilters, availableSorts, showPlatformFilter, children }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const { value } = e.target;
    if (!value) {
        setFilters(prev => ({...prev, sortBy: undefined, sortOrder: undefined}));
        return;
    }
    const [sortBy, sortOrder] = value.split(':');
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  return (
    <div className="filters-container card-base">
      <div className="filter-row">
        {children}
        
        {showPlatformFilter && (
            <div className="filter-group">
                <label>Plataforma</label>
                <select name="platform" value={filters.platform || 'all'} onChange={handleInputChange}>
                    <option value="all">Todas</option>
                    <option value="Golden Brasil">Golden Brasil</option>
                    <option value="Diamond Prime">Diamond Prime</option>
                </select>
            </div>
        )}

        <div className="filter-group">
          <label>Data Início</label>
          <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleInputChange} />
        </div>
        <div className="filter-group">
          <label>Data Fim</label>
          <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleInputChange} />
        </div>
      </div>
      <div className="filter-row">
        <div className="filter-group">
          <label>Valor Mín.</label>
          <input type="number" name="minAmount" placeholder="Ex: 5000" value={filters.minAmount || ''} onChange={handleInputChange} />
        </div>
        <div className="filter-group">
          <label>Valor Máx.</label>
          <input type="number" name="maxAmount" placeholder="Ex: 100000" value={filters.maxAmount || ''} onChange={handleInputChange} />
        </div>
        <div className="filter-group">
          <label>Ordenar por</label>
          <select onChange={handleSortChange} value={filters.sortBy ? `${filters.sortBy}:${filters.sortOrder}` : ''}>
            <option value="">Padrão</option>
            {availableSorts.map(sort => (
              <optgroup label={sort.label} key={sort.label}>
                <option value={`${sort.value}:desc`}>Maior para Menor</option>
                <option value={`${sort.value}:asc`}>Menor para Maior</option>
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TableFilters;