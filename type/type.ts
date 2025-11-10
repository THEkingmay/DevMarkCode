type User =  {
  uid: string;
  email : string , 
  name : string , 
  image : string ,
  create_at : string
}

interface PostTitle {
  id: string,
  title: string,
  tags: string[] , 
  create_at : string
}
export type {User , PostTitle}