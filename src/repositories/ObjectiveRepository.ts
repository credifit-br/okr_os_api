import { EntityRepository, Repository } from "typeorm";
import { Objective } from "../models";

@EntityRepository(Objective)
export class ObjectiveRepository extends Repository<Objective> {}
