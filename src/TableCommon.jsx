import React, { useState } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const TableCommon = ({ columns, dataSource, rowKey = 'id' }) => {
    const [numberRange, setNumberRange] = useState({});
    const [dateRange, setDateRange] = useState({});

    // Filter for text search
    const getColumnSearchProps = (dataIndex) => {
        const handleSearch = (selectedKeys, confirm) => {
            confirm();
        };
        const handleReset = (clearFilters) => {
            clearFilters();
        };
        return {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div
                    style={{
                        padding: 12,
                        borderRadius: 8,
                        background: '#fafbfc',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        minWidth: 220,
                    }}
                >
                    <Input
                        placeholder={`Tìm kiếm ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm)}
                        style={{ marginBottom: 12, borderRadius: 6 }}
                    />
                    <Space style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys, confirm)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90, borderRadius: 6 }}
                        >
                            Tìm kiếm
                        </Button>
                        <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90, borderRadius: 6 }}>
                            Xóa
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) =>
                record[dataIndex]
                    ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                    : '',
            render: text => text,
        };
    };

    // Filter for number range (e.g. price)
    const getNumberRangeFilterProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 12,
                    borderRadius: 8,
                    background: '#fafbfc',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    minWidth: 220,
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    <Input
                        placeholder="Min"
                        type="number"
                        value={numberRange[dataIndex]?.min || ''}
                        onChange={e => setNumberRange(r => ({ ...r, [dataIndex]: { ...r[dataIndex], min: e.target.value } }))}
                        style={{ borderRadius: 6 }}
                    />
                    <Input
                        placeholder="Max"
                        type="number"
                        value={numberRange[dataIndex]?.max || ''}
                        onChange={e => setNumberRange(r => ({ ...r, [dataIndex]: { ...r[dataIndex], max: e.target.value } }))}
                        style={{ borderRadius: 6 }}
                    />
                    <Space style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedKeys([JSON.stringify(numberRange[dataIndex] || {})]);
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90, borderRadius: 6 }}
                        >
                            Lọc
                        </Button>
                        <Button
                            onClick={() => {
                                setNumberRange(r => ({ ...r, [dataIndex]: { min: '', max: '' } }));
                                clearFilters();
                            }}
                            size="small"
                            style={{ width: 90, borderRadius: 6 }}
                        >
                            Xóa
                        </Button>
                    </Space>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            let range = {};
            try { range = JSON.parse(value); } catch { /* empty */ }
            const min = range.min !== '' && range.min !== undefined ? Number(range.min) : -Infinity;
            const max = range.max !== '' && range.max !== undefined ? Number(range.max) : Infinity;
            const val = Number(record[dataIndex]);
            return val >= min && val <= max;
        },
        render: text => text,
    });

    // Filter for date range (e.g. updatedAt)
    const getDateRangeFilterProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 12,
                    borderRadius: 8,
                    background: '#fafbfc',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    minWidth: 260,
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    <Input
                        placeholder="Từ ngày (YYYY-MM-DD)"
                        type="date"
                        value={dateRange[dataIndex]?.from || ''}
                        onChange={e => setDateRange(r => ({ ...r, [dataIndex]: { ...r[dataIndex], from: e.target.value } }))}
                        style={{ borderRadius: 6 }}
                    />
                    <Input
                        placeholder="Đến ngày (YYYY-MM-DD)"
                        type="date"
                        value={dateRange[dataIndex]?.to || ''}
                        onChange={e => setDateRange(r => ({ ...r, [dataIndex]: { ...r[dataIndex], to: e.target.value } }))}
                        style={{ borderRadius: 6 }}
                    />
                    <Space style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedKeys([JSON.stringify(dateRange[dataIndex] || {})]);
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90, borderRadius: 6 }}
                        >
                            Lọc
                        </Button>
                        <Button
                            onClick={() => {
                                setDateRange(r => ({ ...r, [dataIndex]: { from: '', to: '' } }));
                                clearFilters();
                            }}
                            size="small"
                            style={{ width: 90, borderRadius: 6 }}
                        >
                            Xóa
                        </Button>
                    </Space>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            let range = {};
            try { range = JSON.parse(value); } catch { /* empty */ }
            const from = range.from ? new Date(range.from) : new Date('1970-01-01');
            const to = range.to ? new Date(range.to) : new Date('2999-12-31');
            let dateVal;
            if (record[dataIndex]?.seconds) {
                dateVal = new Date(record[dataIndex].seconds * 1000);
            } else if (record[dataIndex]) {
                dateVal = new Date(record[dataIndex]);
            } else {
                return false;
            }
            return dateVal >= from && dateVal <= to;
        },
        render: text => text?.seconds ? new Date(text.seconds * 1000).toLocaleString() : (text ? text.toString() : '-'),
    });

    // Add search, sort, and range filter props to columns
    const enhancedColumns = columns.map(col => {
        let newCol = { ...col };
        if (col.dataIndex === 'price') {
            newCol = {
                ...newCol,
                ...getNumberRangeFilterProps('price'),
                sorter: (a, b) => Number(a.price) - Number(b.price),
            };
        } else if (col.dataIndex === 'updatedAt') {
            newCol = {
                ...newCol,
                ...getDateRangeFilterProps('updatedAt'),
                sorter: (a, b) => {
                    const aTime = a.updatedAt?.seconds ? a.updatedAt.seconds : 0;
                    const bTime = b.updatedAt?.seconds ? b.updatedAt.seconds : 0;
                    return aTime - bTime;
                },
            };
        } else if (col.searchable) {
            newCol = {
                ...newCol,
                ...getColumnSearchProps(col.dataIndex),
                sorter: (a, b) => {
                    if (typeof a[col.dataIndex] === 'string' && typeof b[col.dataIndex] === 'string') {
                        return a[col.dataIndex].localeCompare(b[col.dataIndex]);
                    }
                    return 0;
                },
            };
        }
        return newCol;
    });

    return (
        <Table
            columns={enhancedColumns}
            dataSource={dataSource}
            rowKey={rowKey}
            pagination={{ pageSize: 10 }}
        />
    );
};

export default TableCommon;
