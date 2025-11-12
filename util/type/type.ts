type User = {
  uid: string;
  email: string;
  name: string;
  image: string;
  create_at: string;
};

interface PostTitle {
  id: string;
  title: string;
  tags: string[];
  created_at: string;
}

interface Code {
  code: string;
  description: string;
  language: string;
}

interface CodeStructure extends Code {
    id : string,
}

interface Link {
  id : string,
  link : string , 
}


interface PostForm {
  title: string;
  description: string | null;
  tags: Tag[]; // เก็บแท็กๆ ให้กด
  codeSnip: Code[]; //เก็ยเป็น text ยาวๆ แต่จะเอาไปกรอกบน code highler
  links: string[]; // เก็บ URL ให้ผู้ใช้กรอกได้
}

interface Tag {
  id: string;
  description: string;
}

interface TagStructure extends Tag {
  created_at : string
}


interface PostStructure{
  post_id : string , 
  uid : string ,
  title : string , 
  description : string , 
  created_at : string ,
  tags : TagStructure[] , // [ {id , description  , creacted_at} ,...]
  links : Link[] ,  // [ { id , link } , ...]
  codes : CodeStructure[] , // [ { id , code , descriton , language , description }, .. ]
}

export type { User, PostTitle, PostForm, Code, Tag , PostStructure };
