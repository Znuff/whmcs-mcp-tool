#!/usr/bin/env node
/**
 * WHMCS MCP Server
 * 
 * A Model Context Protocol server for managing WHMCS installations.
 * Provides tools for managing clients, products, billing, tickets, domains, and more.
 */

import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';
import { WhmcsApiClient, WhmcsConfig } from './whmcs-client.js';

// Environment variables for WHMCS connection
const config: WhmcsConfig = {
    apiUrl: process.env.WHMCS_API_URL || '',
    apiIdentifier: process.env.WHMCS_API_IDENTIFIER || '',
    apiSecret: process.env.WHMCS_API_SECRET || '',
    accessKey: process.env.WHMCS_ACCESS_KEY,
};

// Validate required configuration
function validateConfig(): boolean {
    if (!config.apiUrl || !config.apiIdentifier || !config.apiSecret) {
        console.error('Missing required WHMCS configuration. Please set the following environment variables:');
        console.error('  WHMCS_API_URL - The URL to your WHMCS installation (e.g., https://example.com/whmcs/)');
        console.error('  WHMCS_API_IDENTIFIER - Your WHMCS API credential identifier');
        console.error('  WHMCS_API_SECRET - Your WHMCS API credential secret');
        console.error('  WHMCS_ACCESS_KEY (optional) - API access key if configured in WHMCS');
        return false;
    }
    return true;
}

// Create the WHMCS client
const whmcsClient = new WhmcsApiClient(config);

// Create the MCP server
const server = new McpServer({
    name: 'whmcs-mcp-server',
    version: '1.0.0',
});

// ========================================
// CLIENT MANAGEMENT TOOLS
// ========================================

server.registerTool(
    'whmcs_get_clients',
    {
        title: 'Get Clients',
        description: 'Get a list of clients from WHMCS with optional filtering and pagination',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset for results (default 0)'),
            limitnum: z.number().optional().describe('Number of results to return (default 25)'),
            sorting: z.enum(['ASC', 'DESC']).optional().describe('Sort order'),
            status: z.string().optional().describe('Filter by status (Active, Inactive, Closed)'),
            search: z.string().optional().describe('Search term to filter clients'),
            orderby: z.string().optional().describe('Field to order by'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getClients(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_client_details',
    {
        title: 'Get Client Details',
        description: 'Get detailed information about a specific client',
        inputSchema: {
            clientid: z.number().optional().describe('The client ID to retrieve'),
            email: z.string().optional().describe('The email address to search for'),
            stats: z.boolean().optional().describe('Include client statistics'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getClientDetails(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_add_client',
    {
        title: 'Add Client',
        description: 'Create a new client in WHMCS',
        inputSchema: {
            firstname: z.string().describe('Client first name'),
            lastname: z.string().describe('Client last name'),
            email: z.string().email().describe('Client email address'),
            address1: z.string().describe('Street address'),
            city: z.string().describe('City'),
            state: z.string().describe('State/Province'),
            postcode: z.string().describe('Postal/ZIP code'),
            country: z.string().describe('Country (2-letter ISO code)'),
            phonenumber: z.string().describe('Phone number'),
            password2: z.string().describe('Password for the client account'),
            companyname: z.string().optional().describe('Company name'),
            address2: z.string().optional().describe('Address line 2'),
            currency: z.number().optional().describe('Currency ID'),
            language: z.string().optional().describe('Client language'),
            groupid: z.number().optional().describe('Client group ID'),
            notes: z.string().optional().describe('Admin notes'),
            noemail: z.boolean().optional().describe('Do not send welcome email'),
        },
    },
    async (params) => {
        const result = await whmcsClient.addClient(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_update_client',
    {
        title: 'Update Client',
        description: 'Update an existing client in WHMCS',
        inputSchema: {
            clientid: z.number().describe('The client ID to update'),
            firstname: z.string().optional().describe('Client first name'),
            lastname: z.string().optional().describe('Client last name'),
            email: z.string().email().optional().describe('Client email address'),
            companyname: z.string().optional().describe('Company name'),
            address1: z.string().optional().describe('Street address'),
            address2: z.string().optional().describe('Address line 2'),
            city: z.string().optional().describe('City'),
            state: z.string().optional().describe('State/Province'),
            postcode: z.string().optional().describe('Postal/ZIP code'),
            country: z.string().optional().describe('Country (2-letter ISO code)'),
            phonenumber: z.string().optional().describe('Phone number'),
            password2: z.string().optional().describe('New password'),
            status: z.string().optional().describe('Client status (Active, Inactive, Closed)'),
            credit: z.string().optional().describe('Credit balance'),
            notes: z.string().optional().describe('Admin notes'),
            language: z.string().optional().describe('Client language'),
        },
    },
    async (params) => {
        const result = await whmcsClient.updateClient(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_delete_client',
    {
        title: 'Delete Client',
        description: 'Delete a client from WHMCS (use with caution)',
        inputSchema: {
            clientid: z.number().describe('The client ID to delete'),
        },
    },
    async (params) => {
        const result = await whmcsClient.deleteClient(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_client_products',
    {
        title: 'Get Client Products',
        description: 'Get products/services owned by a client',
        inputSchema: {
            clientid: z.number().optional().describe('The client ID'),
            serviceid: z.number().optional().describe('Specific service ID'),
            domain: z.string().optional().describe('Filter by domain'),
            pid: z.number().optional().describe('Filter by product ID'),
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getClientProducts(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_client_domains',
    {
        title: 'Get Client Domains',
        description: 'Get domains owned by a client',
        inputSchema: {
            clientid: z.number().optional().describe('The client ID'),
            domainid: z.number().optional().describe('Specific domain ID'),
            domain: z.string().optional().describe('Filter by domain name'),
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getClientDomains(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// PRODUCT MANAGEMENT TOOLS
// ========================================

server.registerTool(
    'whmcs_get_products',
    {
        title: 'Get Products',
        description: 'Get available products/services from WHMCS',
        inputSchema: {
            pid: z.number().optional().describe('Specific product ID'),
            gid: z.number().optional().describe('Filter by product group ID'),
            module: z.string().optional().describe('Filter by server module'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getProducts(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_product_groups',
    {
        title: 'Get Product Groups',
        description: 'Get all product groups from WHMCS',
        inputSchema: {},
    },
    async () => {
        const result = await whmcsClient.getProductGroups();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// BILLING & INVOICE TOOLS
// ========================================

server.registerTool(
    'whmcs_get_invoices',
    {
        title: 'Get Invoices',
        description: 'Get invoices with optional filtering',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
            userid: z.number().optional().describe('Filter by client ID'),
            status: z.enum(['Paid', 'Unpaid', 'Cancelled', 'Refunded', 'Collections', 'Draft']).optional().describe('Filter by status'),
            orderby: z.string().optional().describe('Field to order by'),
            order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getInvoices(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_invoice',
    {
        title: 'Get Invoice Details',
        description: 'Get detailed information about a specific invoice',
        inputSchema: {
            invoiceid: z.number().describe('The invoice ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getInvoice(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_create_invoice',
    {
        title: 'Create Invoice',
        description: 'Create a new invoice for a client',
        inputSchema: {
            userid: z.number().describe('Client ID'),
            status: z.enum(['Draft', 'Unpaid', 'Paid', 'Cancelled', 'Refunded', 'Collections']).optional().describe('Invoice status'),
            sendinvoice: z.boolean().optional().describe('Send invoice email'),
            paymentmethod: z.string().optional().describe('Payment method'),
            taxrate: z.number().optional().describe('Tax rate percentage'),
            taxrate2: z.number().optional().describe('Second tax rate percentage'),
            date: z.string().optional().describe('Invoice date (YYYY-MM-DD)'),
            duedate: z.string().optional().describe('Due date (YYYY-MM-DD)'),
            notes: z.string().optional().describe('Invoice notes'),
            itemdescription: z.array(z.string()).optional().describe('Line item descriptions'),
            itemamount: z.array(z.number()).optional().describe('Line item amounts'),
            itemtaxed: z.array(z.boolean()).optional().describe('Line items taxed flags'),
        },
    },
    async (params) => {
        const result = await whmcsClient.createInvoice(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_update_invoice',
    {
        title: 'Update Invoice',
        description: 'Update an existing invoice',
        inputSchema: {
            invoiceid: z.number().describe('Invoice ID to update'),
            status: z.enum(['Draft', 'Unpaid', 'Paid', 'Cancelled', 'Refunded', 'Collections']).optional().describe('New status'),
            paymentmethod: z.string().optional().describe('Payment method'),
            date: z.string().optional().describe('Invoice date (YYYY-MM-DD)'),
            duedate: z.string().optional().describe('Due date (YYYY-MM-DD)'),
            notes: z.string().optional().describe('Invoice notes'),
            publish: z.boolean().optional().describe('Publish draft invoice'),
            publishandsendemail: z.boolean().optional().describe('Publish and send email'),
        },
    },
    async (params) => {
        const result = await whmcsClient.updateInvoice(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_add_payment',
    {
        title: 'Add Payment',
        description: 'Record a payment on an invoice',
        inputSchema: {
            invoiceid: z.number().describe('Invoice ID'),
            transid: z.string().describe('Transaction ID'),
            gateway: z.string().describe('Payment gateway name'),
            amount: z.number().optional().describe('Payment amount'),
            fees: z.number().optional().describe('Transaction fees'),
            noemail: z.boolean().optional().describe('Do not send email'),
            date: z.string().optional().describe('Payment date (YYYY-MM-DD)'),
        },
    },
    async (params) => {
        const result = await whmcsClient.addPayment(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_apply_credit',
    {
        title: 'Apply Credit',
        description: 'Apply credit to an invoice',
        inputSchema: {
            invoiceid: z.number().describe('Invoice ID'),
            amount: z.number().describe('Amount of credit to apply'),
            noemail: z.boolean().optional().describe('Do not send email'),
        },
    },
    async (params) => {
        const result = await whmcsClient.applyCredit(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_transactions',
    {
        title: 'Get Transactions',
        description: 'Get payment transactions',
        inputSchema: {
            invoiceid: z.number().optional().describe('Filter by invoice ID'),
            clientid: z.number().optional().describe('Filter by client ID'),
            transid: z.string().optional().describe('Filter by transaction ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getTransactions(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// SUPPORT TICKET TOOLS
// ========================================

server.registerTool(
    'whmcs_get_tickets',
    {
        title: 'Get Tickets',
        description: 'Get support tickets with optional filtering',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
            deptid: z.number().optional().describe('Filter by department ID'),
            clientid: z.number().optional().describe('Filter by client ID'),
            email: z.string().optional().describe('Filter by email'),
            status: z.string().optional().describe('Filter by status'),
            subject: z.string().optional().describe('Filter by subject'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getTickets(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_ticket',
    {
        title: 'Get Ticket Details',
        description: 'Get detailed information about a specific ticket including replies',
        inputSchema: {
            ticketid: z.number().describe('Ticket ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getTicket(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_open_ticket',
    {
        title: 'Open Ticket',
        description: 'Create a new support ticket',
        inputSchema: {
            deptid: z.number().describe('Department ID'),
            subject: z.string().describe('Ticket subject'),
            message: z.string().describe('Ticket message/description'),
            clientid: z.number().optional().describe('Client ID'),
            contactid: z.number().optional().describe('Contact ID'),
            name: z.string().optional().describe('Name (if not a client)'),
            email: z.string().optional().describe('Email (if not a client)'),
            priority: z.enum(['Low', 'Medium', 'High']).optional().describe('Ticket priority'),
            serviceid: z.number().optional().describe('Related service ID'),
            domainid: z.number().optional().describe('Related domain ID'),
            admin: z.boolean().optional().describe('Opened by admin'),
            markdown: z.boolean().optional().describe('Message contains markdown'),
        },
    },
    async (params) => {
        const result = await whmcsClient.openTicket(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_add_ticket_reply',
    {
        title: 'Add Ticket Reply',
        description: 'Reply to an existing support ticket',
        inputSchema: {
            ticketid: z.number().describe('Ticket ID'),
            message: z.string().describe('Reply message'),
            clientid: z.number().optional().describe('Client ID'),
            contactid: z.number().optional().describe('Contact ID'),
            name: z.string().optional().describe('Name'),
            email: z.string().optional().describe('Email'),
            adminusername: z.string().optional().describe('Admin username'),
            status: z.string().optional().describe('New ticket status'),
            noemail: z.boolean().optional().describe('Do not send email'),
            markdown: z.boolean().optional().describe('Message contains markdown'),
        },
    },
    async (params) => {
        const result = await whmcsClient.addTicketReply(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_update_ticket',
    {
        title: 'Update Ticket',
        description: 'Update ticket properties',
        inputSchema: {
            ticketid: z.number().describe('Ticket ID'),
            deptid: z.number().optional().describe('Department ID'),
            subject: z.string().optional().describe('Subject'),
            userid: z.number().optional().describe('Assign to client ID'),
            name: z.string().optional().describe('Name'),
            email: z.string().optional().describe('Email'),
            priority: z.enum(['Low', 'Medium', 'High']).optional().describe('Priority'),
            status: z.string().optional().describe('Status'),
            flag: z.number().optional().describe('Flag to admin ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.updateTicket(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_delete_ticket',
    {
        title: 'Delete Ticket',
        description: 'Delete a support ticket (use with caution)',
        inputSchema: {
            ticketid: z.number().describe('Ticket ID to delete'),
        },
    },
    async (params) => {
        const result = await whmcsClient.deleteTicket(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_support_departments',
    {
        title: 'Get Support Departments',
        description: 'Get list of support departments',
        inputSchema: {
            ignore_dept_assignments: z.boolean().optional().describe('Ignore department assignments'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getSupportDepartments(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_support_statuses',
    {
        title: 'Get Support Statuses',
        description: 'Get ticket statuses with counts',
        inputSchema: {
            deptid: z.number().optional().describe('Filter by department ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getSupportStatuses(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// DOMAIN MANAGEMENT TOOLS
// ========================================

server.registerTool(
    'whmcs_register_domain',
    {
        title: 'Register Domain',
        description: 'Send domain registration command to registrar',
        inputSchema: {
            domainid: z.number().optional().describe('Domain ID'),
            domain: z.string().optional().describe('Domain name'),
        },
    },
    async (params) => {
        const result = await whmcsClient.registerDomain(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_transfer_domain',
    {
        title: 'Transfer Domain',
        description: 'Send domain transfer command to registrar',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.transferDomain(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_renew_domain',
    {
        title: 'Renew Domain',
        description: 'Send domain renewal command to registrar',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.renewDomain(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_domain_whois',
    {
        title: 'Get Domain WHOIS',
        description: 'Get WHOIS information for a domain',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getDomainWhoisInfo(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_domain_nameservers',
    {
        title: 'Get Domain Nameservers',
        description: 'Get nameservers for a domain',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getDomainNameservers(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_update_domain_nameservers',
    {
        title: 'Update Domain Nameservers',
        description: 'Update nameservers for a domain',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
            ns1: z.string().optional().describe('Nameserver 1'),
            ns2: z.string().optional().describe('Nameserver 2'),
            ns3: z.string().optional().describe('Nameserver 3'),
            ns4: z.string().optional().describe('Nameserver 4'),
            ns5: z.string().optional().describe('Nameserver 5'),
        },
    },
    async (params) => {
        const result = await whmcsClient.updateDomainNameservers(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_domain_lock_status',
    {
        title: 'Get Domain Lock Status',
        description: 'Get lock/unlock status for a domain',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getDomainLockingStatus(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_update_domain_lock_status',
    {
        title: 'Update Domain Lock Status',
        description: 'Lock or unlock a domain',
        inputSchema: {
            domainid: z.number().describe('Domain ID'),
            lockstatus: z.boolean().optional().describe('Lock status (true to lock)'),
        },
    },
    async (params) => {
        const result = await whmcsClient.updateDomainLockingStatus(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_tld_pricing',
    {
        title: 'Get TLD Pricing',
        description: 'Get domain TLD pricing information',
        inputSchema: {
            currencyid: z.number().optional().describe('Currency ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getTLDPricing(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// ORDER MANAGEMENT TOOLS
// ========================================

server.registerTool(
    'whmcs_get_orders',
    {
        title: 'Get Orders',
        description: 'Get orders with optional filtering',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
            id: z.number().optional().describe('Specific order ID'),
            userid: z.number().optional().describe('Filter by client ID'),
            status: z.string().optional().describe('Filter by status'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getOrders(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_accept_order',
    {
        title: 'Accept Order',
        description: 'Accept and process a pending order',
        inputSchema: {
            orderid: z.number().describe('Order ID'),
            serverid: z.number().optional().describe('Server to provision on'),
            serviceusername: z.string().optional().describe('Username for service'),
            servicepassword: z.string().optional().describe('Password for service'),
            registrar: z.string().optional().describe('Domain registrar module'),
            autosetup: z.boolean().optional().describe('Auto setup products'),
            sendemail: z.boolean().optional().describe('Send setup email'),
        },
    },
    async (params) => {
        const result = await whmcsClient.acceptOrder(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_cancel_order',
    {
        title: 'Cancel Order',
        description: 'Cancel an order',
        inputSchema: {
            orderid: z.number().describe('Order ID'),
            cancelsub: z.boolean().optional().describe('Cancel subscription'),
            noemail: z.boolean().optional().describe('Do not send email'),
        },
    },
    async (params) => {
        const result = await whmcsClient.cancelOrder(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_delete_order',
    {
        title: 'Delete Order',
        description: 'Delete an order (use with caution)',
        inputSchema: {
            orderid: z.number().describe('Order ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.deleteOrder(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_fraud_order',
    {
        title: 'Mark Order as Fraud',
        description: 'Mark an order as fraudulent',
        inputSchema: {
            orderid: z.number().describe('Order ID'),
            cancelsub: z.boolean().optional().describe('Cancel subscription'),
        },
    },
    async (params) => {
        const result = await whmcsClient.fraudOrder(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_pending_order',
    {
        title: 'Set Order to Pending',
        description: 'Set an order status to pending',
        inputSchema: {
            orderid: z.number().describe('Order ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.pendingOrder(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// SERVER MANAGEMENT TOOLS
// ========================================

server.registerTool(
    'whmcs_get_servers',
    {
        title: 'Get Servers',
        description: 'Get list of configured servers',
        inputSchema: {
            fetchStatus: z.boolean().optional().describe('Fetch server status'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getServers(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// MODULE MANAGEMENT TOOLS
// ========================================

server.registerTool(
    'whmcs_module_create',
    {
        title: 'Module Create',
        description: 'Create/provision a service account',
        inputSchema: {
            accountid: z.number().describe('Service ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.moduleCreate(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_module_suspend',
    {
        title: 'Module Suspend',
        description: 'Suspend a service account',
        inputSchema: {
            accountid: z.number().describe('Service ID'),
            suspendreason: z.string().optional().describe('Suspension reason'),
        },
    },
    async (params) => {
        const result = await whmcsClient.moduleSuspend(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_module_unsuspend',
    {
        title: 'Module Unsuspend',
        description: 'Unsuspend a service account',
        inputSchema: {
            accountid: z.number().describe('Service ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.moduleUnsuspend(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_module_terminate',
    {
        title: 'Module Terminate',
        description: 'Terminate a service account',
        inputSchema: {
            accountid: z.number().describe('Service ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.moduleTerminate(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_module_change_password',
    {
        title: 'Module Change Password',
        description: 'Change password for a service account',
        inputSchema: {
            accountid: z.number().describe('Service ID'),
            servicepassword: z.string().optional().describe('New password'),
        },
    },
    async (params) => {
        const result = await whmcsClient.moduleChangePassword(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// SYSTEM TOOLS
// ========================================

server.registerTool(
    'whmcs_get_stats',
    {
        title: 'Get System Stats',
        description: 'Get WHMCS system statistics including income and order counts',
        inputSchema: {},
    },
    async () => {
        const result = await whmcsClient.getStats();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_admin_users',
    {
        title: 'Get Admin Users',
        description: 'Get list of admin users',
        inputSchema: {},
    },
    async () => {
        const result = await whmcsClient.getAdminUsers();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_payment_methods',
    {
        title: 'Get Payment Methods',
        description: 'Get available payment methods',
        inputSchema: {},
    },
    async () => {
        const result = await whmcsClient.getPaymentMethods();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_currencies',
    {
        title: 'Get Currencies',
        description: 'Get configured currencies',
        inputSchema: {},
    },
    async () => {
        const result = await whmcsClient.getCurrencies();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_activity_log',
    {
        title: 'Get Activity Log',
        description: 'Get system activity log',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
            userid: z.number().optional().describe('Filter by user ID'),
            date: z.string().optional().describe('Filter by date'),
            user: z.string().optional().describe('Filter by user'),
            description: z.string().optional().describe('Filter by description'),
            ipaddress: z.string().optional().describe('Filter by IP address'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getActivityLog(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_log_activity',
    {
        title: 'Log Activity',
        description: 'Add an entry to the activity log',
        inputSchema: {
            description: z.string().describe('Activity description'),
            userid: z.number().optional().describe('Associated user ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.logActivity(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_email_templates',
    {
        title: 'Get Email Templates',
        description: 'Get list of email templates',
        inputSchema: {
            type: z.enum(['general', 'product', 'domain', 'invoice', 'support', 'affiliate']).optional().describe('Template type'),
            language: z.string().optional().describe('Template language'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getEmailTemplates(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_send_email',
    {
        title: 'Send Email',
        description: 'Send an email to a client',
        inputSchema: {
            messagename: z.string().optional().describe('Email template name'),
            id: z.number().optional().describe('Related ID (client, invoice, etc.)'),
            customtype: z.string().optional().describe('Custom type'),
            customsubject: z.string().optional().describe('Custom subject'),
            custommessage: z.string().optional().describe('Custom message'),
        },
    },
    async (params) => {
        const result = await whmcsClient.sendEmail(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_get_todo_items',
    {
        title: 'Get To-Do Items',
        description: 'Get admin to-do items',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
            status: z.enum(['Incomplete', 'Complete', 'Pending']).optional().describe('Filter by status'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getToDoItems(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// AFFILIATE TOOLS
// ========================================

server.registerTool(
    'whmcs_get_affiliates',
    {
        title: 'Get Affiliates',
        description: 'Get list of affiliates',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getAffiliates(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_activate_affiliate',
    {
        title: 'Activate Affiliate',
        description: 'Activate a client as an affiliate',
        inputSchema: {
            userid: z.number().describe('Client ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.affiliateActivate(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// PROMOTION TOOLS
// ========================================

server.registerTool(
    'whmcs_get_promotions',
    {
        title: 'Get Promotions',
        description: 'Get list of promotions/coupons',
        inputSchema: {
            code: z.string().optional().describe('Specific promotion code'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getPromotions(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// QUOTE TOOLS
// ========================================

server.registerTool(
    'whmcs_get_quotes',
    {
        title: 'Get Quotes',
        description: 'Get list of quotes',
        inputSchema: {
            limitstart: z.number().optional().describe('Starting offset'),
            limitnum: z.number().optional().describe('Number of results'),
            quoteid: z.number().optional().describe('Specific quote ID'),
            userid: z.number().optional().describe('Filter by client ID'),
            subject: z.string().optional().describe('Filter by subject'),
            stage: z.string().optional().describe('Filter by stage'),
        },
    },
    async (params) => {
        const result = await whmcsClient.getQuotes(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_create_quote',
    {
        title: 'Create Quote',
        description: 'Create a new quote',
        inputSchema: {
            subject: z.string().describe('Quote subject'),
            stage: z.enum(['Draft', 'Delivered', 'On Hold', 'Accepted', 'Lost', 'Dead']).describe('Quote stage'),
            validuntil: z.string().describe('Valid until date (YYYY-MM-DD)'),
            userid: z.number().optional().describe('Client ID'),
            firstname: z.string().optional().describe('First name'),
            lastname: z.string().optional().describe('Last name'),
            companyname: z.string().optional().describe('Company name'),
            email: z.string().optional().describe('Email'),
            proposal: z.string().optional().describe('Proposal text'),
            customernotes: z.string().optional().describe('Customer notes'),
            adminnotes: z.string().optional().describe('Admin notes'),
        },
    },
    async (params) => {
        const result = await whmcsClient.createQuote(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_accept_quote',
    {
        title: 'Accept Quote',
        description: 'Accept a quote and convert to invoice',
        inputSchema: {
            quoteid: z.number().describe('Quote ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.acceptQuote(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

server.registerTool(
    'whmcs_delete_quote',
    {
        title: 'Delete Quote',
        description: 'Delete a quote',
        inputSchema: {
            quoteid: z.number().describe('Quote ID'),
        },
    },
    async (params) => {
        const result = await whmcsClient.deleteQuote(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);

// ========================================
// START SERVER
// ========================================

async function main() {
    if (!validateConfig()) {
        // Still start the server but tools will fail gracefully
        console.error('Warning: WHMCS configuration incomplete. Tools will not function until configured.');
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('WHMCS MCP Server started');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
