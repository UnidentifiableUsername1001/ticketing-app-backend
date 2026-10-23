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

    schema.pre('save', function(options) {
        if (options?.skipTenant) return;

        const localStore = tenantStorage.getStore();

        if (!localStore) {
            throw new Error('Tenant context missing');
        };

        this.companyId = localStore
        return;
    });

    schema.pre('aggregate', function() {

        if (this.options?.skipTenant) return;

        const localStore = tenantStorage.getStore();

        if (!localStore) throw new Error('Tenant context missing');
        
        this.pipeline().unshift({ $match: { companyId: localStore }});
        return;
    });

    
    operations.forEach(op => {
        schema.pre(op, function() {
            const reqQuery = this.getFilter();
            const localStore = tenantStorage.getStore();

            if (this.getOptions().skipTenant) return;
            if (!localStore) throw new Error('Tenant context missing');

            this.setQuery({...reqQuery, companyId: localStore});

            return;
        });
    });
};

export {
    auditPlugin
}