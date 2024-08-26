using { com.satinfotech.cloudapps as db } from '../db/schema';
using {API_BILLING_DOCUMENT_SRV as billingapi} from './external/API_BILLING_DOCUMENT_SRV';

service satinfotech @(requires: 'authenticated-user') {

    // Projection on external OData service
    entity BillingInfo as projection on billingapi.A_BillingDocument {
        BillingDocument,
        SDDocumentCategory,
        SalesOrganization,
        BillingDocumentDate,
        TotalNetAmount,
        FiscalYear,
        CompanyCode,
        LastChangeDateTime
        
    }

    entity BillingItem as projection on billingapi.A_BillingDocumentItem {
      BillingDocumentItem,
      BillingDocumentItemText,
      BaseUnit,
      BillingQuantityUnit,
      Plant,
      StorageLocation,
      BillingDocument,
      NetAmount,
      TransactionCurrency
    }

    // Projection on local database schema
    entity Billing as projection on db.Billing 
    
    action BillingFetch() returns String;
    action Status() returns String;

}

// Enable draft support for Billing entity
annotate satinfotech.Billing with @odata.draft.enabled;

annotate satinfotech.Billing with @(
    UI.LineItem: [
        { Label: 'Billing Document', Value: BillingDocument },
        { Label: 'Document Category', Value: SDDocumentCategory },
        { Label: 'Sales Organization', Value: SalesOrganization },
        { Label: 'Billing Date', Value: BillingDocumentDate },
        { Label: 'Financial Year', Value: FiscalYear },
        { Label: 'Company Code', Value: CompanyCode },
        { Label: 'Last Changed Date Time ', Value: LastChangeDateTime }

    ],
    UI.FieldGroup #BillingInformation: {
        $Type: 'UI.FieldGroupType',
        Data: [
            { $Type: 'UI.DataField', Value: BillingDocument },
            { $Type: 'UI.DataField', Value: SDDocumentCategory },
            { $Type: 'UI.DataField', Value: SalesOrganization },
            { $Type: 'UI.DataField', Value: BillingDocumentDate },
            { $Type: 'UI.DataField', Value: FiscalYear },
            { $Type: 'UI.DataField', Value: CompanyCode },
            { $Type: 'UI.DataField', Value: LastChangeDateTime }
        ]
    },
    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'BillingFacet',
            Label: 'Billing Information',
            Target: '@UI.FieldGroup#BillingInformation'
        },
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'BillingItemsFacet',
            Label: 'Billing Items',
            Target: 'BillingItems/@UI.LineItem'  // Correctly referencing the `item` association
        }
    ]
);

annotate satinfotech.BillingItems with @(
    UI.LineItem: [
        { Label: 'Billing Item', Value: BillingDocumentItem },
        { Label: 'Billing Item Text', Value: BillingDocumentItemText },
        { Label: 'Base Unit', Value: BaseUnit },
        { Label: 'Billing Quantity', Value: BillingQuantityUnit },
        { Label: 'Plant', Value: Plant },
        { Label: 'Storage Location', Value: StorageLocation },
        { Label: 'Net Amount', Value: NetAmount },
        { Label: 'Transaction Currency', Value: TransactionCurrency },
    
    ],
    // UI.FieldGroup #BillingItemDetails: {
    //     $Type: 'UI.FieldGroupType',
    //     Data: [
    //         { $Type: 'UI.DataField', Value: BillingDocumentItem },
    //         { $Type: 'UI.DataField', Value: BillingDocumentItemText },
    //         { $Type: 'UI.DataField', Value: BaseUnit },
    //         { $Type: 'UI.DataField', Value: BillingQuantityUnit },
    //         { $Type: 'UI.DataField', Value: Plant },
    //         { $Type: 'UI.DataField', Value: StorageLocation },
    //         { $Type: 'UI.DataField', Value: BillingDocument_ID_ID }
    //     ]
    // },
    // UI.Facets: [
    //     {
    //         $Type: 'UI.ReferenceFacet',
    //         ID: 'BillingItemsFacet',
    //         Label: 'Billing Items',
    //         Target: '@UI.FieldGroup#BillingItemDetails'  // Correct target reference
    //     }
    // ]
);