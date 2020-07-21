import { Response } from "express";

export const handlePresence = (results: Object, res: Response) => {
  if (results) 
    return res.json( results);
  res.statusCode = 204;
  return res.json();
}

export const handleErrors = (results: Object, res: Response, 
  ok_code: number = 200) => {
  if (results.hasOwnProperty( "error"))
    res.statusCode = 406;
  else
    res.statusCode = ok_code;
  return res.json();
}