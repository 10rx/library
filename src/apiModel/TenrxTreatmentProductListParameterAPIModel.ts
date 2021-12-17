export default interface TenrxTreatmentProductListParameterAPIModel {
    treatmentTypeId:number;
    productId : number;
    categoryId : number;
    genderId : number;
    searchKey : string;
    isWebRequest : boolean;
    pageNumber : number;
    pageSize : number;
    sortColumn : string;
    sortOrder : string;
}