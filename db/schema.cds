namespace com.satinfotech.cloudapps;

using { managed, cuid } from '@sap/cds/common';

entity Billing : managed, cuid {
    @title: 'Billing Document'
    key BillingDocument: String(10);
    @title: 'Document Category'
    SDDocumentCategory: String(4);
    @title: 'Sales Organization'
    SalesOrganization: String(4);
    @title: 'Billing Date'
    BillingDocumentDate: Date;
    @title: 'Financial Year'
    FiscalYear: String(4);
    @title: 'Company Code'
    CompanyCode: String(4);
    @title : 'Last Changed Date & Time'
    LastChangeDateTime:String(40);
    BillingItems : Composition of many BillingItems on BillingItems.BillingDocument= $self.BillingDocument;
}

entity BillingItems : cuid, managed {
    key ID : UUID;
    @title: 'Billing Document'
    BillingDocument: String(10);
    @title: 'Billing Item'
    BillingDocumentItem: String(6);
    @title: 'Billing Item Text'
    BillingDocumentItemText: String(40);
    @title: 'Base Unit'
    BaseUnit: String(3);
    @title: 'Billing Quantity Unit'
    BillingQuantityUnit: String(3);
    @title: 'Plant'
    Plant: String(4);
    @title: 'Storage Location'
    StorageLocation: String(4);
    @title: 'Net Amount'
    NetAmount: Decimal;
    @title: 'Transaction Currency'
    TransactionCurrency: String(5);
}