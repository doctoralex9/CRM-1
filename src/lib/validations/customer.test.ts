import { describe, it, expect } from "vitest"
import { customerSchema } from "./customer"


describe("customerSchema", () => {
    it("accepts a valid company", () => {
        const result = customerSchema.safeParse({
            customerType: "company",
            companyName: "ΑE"
        })
        console.log(result)
        expect(result.success).toBe(true)
    })
})