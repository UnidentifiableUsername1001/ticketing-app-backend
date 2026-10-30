import mongoose from 'mongoose';
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

        console.log("pre.aggregate log: ",JSON.stringify(this))

        if (this.options?.skipTenant) return;

        const localStore = tenantStorage.getStore();

        if (!localStore) throw new Error('Tenant context missing');

        const companyObjectId = mongoose.Types.ObjectId.isValid(localStore)
            ? new mongoose.Types.ObjectId(localStore)
            : localStore;
        
        this.pipeline().unshift({ $match: { companyId: companyObjectId } });

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