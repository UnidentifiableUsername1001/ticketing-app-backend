import { tenantStorage } from '../context/tenantStorage.js';

function auditPlugin(schema) {

    const operations = [ 
        'find', 
        'findOne', 
        'updateMany', 
        'deleteMany', 
        'findOneAndDelete', 
        'findOneAndReplace', 
        'findOneAndUpdate', 
        'updateOne', 
        'deleteOne',
        'countDocuments',
    ]

    schema.pre('save', function() {
        if (this.getOptions().skipTenant) return;

        const localStore = tenantStorage.getStore();

        if (!localStore || !localStore.companyId) return new Error('Tenant context missing');

        this.companyId = localStore.companyId;
        return;
    });

    schema.pre('aggregate', function() {
        if (this.getOptions().skipTenant) return;

        const localStore = tenantStorage.getStore();

        if (!localStore || !localStore.companyId) return new Error('Tenant context missing');
        
        this.pipeline().unshift({ $match: { companyId: localStore.companyId }});
        return;
    });

    
    operations.forEach(op => {
        schema.pre(op, function() {
            const reqQuery = this.getFilter();
            const localStore = tenantStorage.getStore();

            if (this.getOptions().skipTenant) return;
            if (!localStore || !localStore.companyId) return new Error('Tenant context missing');

            this.setQuery({...reqQuery, companyId: localStore.companyId});

            return;
        });
    });
};

export {
    auditPlugin
}