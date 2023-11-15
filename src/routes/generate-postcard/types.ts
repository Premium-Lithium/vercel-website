export interface PostcardRecipient {
    title: string,
    firstname: string,
    lastname: string,
    address1: string,
    address2: string,
    city: string,
    postcode: string,
    country: string
};

export interface Postcard {
    frontImage: Buffer;
    backImage: Buffer;
}