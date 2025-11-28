import { BlockDefinition } from '../types';
import { Block } from '../../types';
import { Table as TableIcon } from 'lucide-react';
import { TableComponent } from '../../components/molecules/blocks/TableComponent';
import { TableProperties } from '../../components/molecules/properties/TableProperties';

export const TableBlock: BlockDefinition = {
    type: 'table',
    label: 'Table',
    icon: TableIcon,
    category: 'data',
    create: (id) => ({ 
        id, 
        type: 'table', 
        content: '', 
        tableContent: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']] 
    }),
    Component: TableComponent,
    PropertiesPanel: TableProperties,
    serializeToWordPress: (block) => {
        const rows = block.tableContent || [];
        const tableHtml = `
          <figure class="wp-block-table"><table>
              <tbody>
                  ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
          </table></figure>
        `;
        return `<!-- wp:table -->\n${tableHtml}\n<!-- /wp:table -->`;
    },
    getContextString: (block) => {
        if (!block.tableContent) return '';
        return "Table Data:\n" + block.tableContent.map(row => `| ${row.join(' | ')} |`).join('\n');
    },
    parseHTML: (html: string): Partial<Block> => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const rows = Array.from(doc.querySelectorAll('tr'));
            if (rows.length > 0) {
                const tableContent = rows.map(tr => 
                    Array.from(tr.querySelectorAll('td, th')).map(td => td.innerHTML)
                );
                if (tableContent.length > 0) {
                    return { content: html, tableContent };
                }
            }
        } catch (e) {
            console.error("Error parsing table replacement:", e);
        }
        return { content: html };
    }
};