/**
 * Quick test script to verify WHMCS API connection
 */
import 'dotenv/config';
import { WhmcsApiClient } from './whmcs-client.js';

const config = {
    apiUrl: process.env.WHMCS_API_URL || '',
    apiIdentifier: process.env.WHMCS_API_IDENTIFIER || '',
    apiSecret: process.env.WHMCS_API_SECRET || '',
    accessKey: process.env.WHMCS_ACCESS_KEY,
};

console.log('Testing WHMCS API connection...');
console.log('URL:', config.apiUrl);
console.log('Identifier:', config.apiIdentifier ? '***' + config.apiIdentifier.slice(-4) : 'NOT SET');

const client = new WhmcsApiClient(config);

async function test() {
    try {
        // Test 1: Get system stats
        console.log('\n--- Testing GetStats ---');
        const stats = await client.getStats();
        console.log('✓ Connection successful!');
        console.log('Income Today:', stats.income_today);
        console.log('Income This Month:', stats.income_thismonth);
        console.log('Pending Orders:', stats.orders_pending);
        console.log('Active Tickets:', stats.tickets_allactive);

        // Test 2: Get clients
        console.log('\n--- Testing GetClients ---');
        const clients = await client.getClients({ limitnum: 5 });
        console.log('✓ Total clients:', clients.totalresults);
        if (clients.clients?.client?.length > 0) {
            console.log('First few clients:');
            clients.clients.client.forEach((c: any) => {
                console.log(`  - ${c.firstname} ${c.lastname} (${c.email}) - ${c.status}`);
            });
        }

        // Test 3: Get products
        console.log('\n--- Testing GetProducts ---');
        const products = await client.getProducts();
        console.log('✓ Total products:', products.totalresults);

        // Test 4: Get support departments
        console.log('\n--- Testing GetSupportDepartments ---');
        const depts = await client.getSupportDepartments();
        console.log('✓ Support departments:', depts.totalresults);
        if (depts.departments?.department?.length > 0) {
            depts.departments.department.forEach((d: any) => {
                console.log(`  - ${d.name} (${d.opentickets} open tickets)`);
            });
        }

        console.log('\n✅ All tests passed! WHMCS MCP Server is ready to use.');

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

test();
