import { describe, it, expect } from "vitest"
import { customerSchema } from "./customer"


describe("customerSchema", () => {
    it("accepts a valid company", () => {
        const result = customerSchema.safeParse({
            customerType: "company",
            companyName: "Αλφα ΑΕ"
        })
        console.log(result)
        expect(result.success).toBe(true)
    })
})