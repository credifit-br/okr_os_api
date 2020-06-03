import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "objectives" })
export class Objective {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;
}
