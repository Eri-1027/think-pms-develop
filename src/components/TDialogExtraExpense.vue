<script>
/**
 * 新增消費彈窗
 */
export default {

}
</script>
<template>
  <!--extra expense -->
  <v-dialog
    v-model="dialog.extraExpense"
    max-width="290"
    persistent
  >
    <v-card>
      <ValidationObserver ref="formExtraExpense">
        <form>
          <v-card-title>
            新增消費：
            <v-spacer />
            <v-btn
              icon
              @click="dialog.extraExpense = false"
            >
              <v-icon>mdi-close-box</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <ValidationProvider
              v-slot="{ errors }"
              name="名稱"
              rules="required"
            >
              <v-select
                v-model="tempExtraExpense.extraExpenseId"
                class="py-2"
                dense
                :error-messages="errors"
                :items="extraExpenseNameItems"
                label="名稱"
                @input="setExtraExpenseSinglePrice"
              />
            </ValidationProvider>
            <ValidationProvider
              v-slot="{ errors }"
              name="單價"
              rules="required"
            >
              <v-text-field
                v-model="tempExtraExpense.extraExpenseOrderSinglePrice"
                class="py-2"
                dense
                :error-messages="errors"
                label="單價"
                readonly
              />
            </ValidationProvider>
            <ValidationProvider
              v-slot="{ errors }"
              name="數量"
              rules="required"
            >
              <v-text-field
                v-model="tempExtraExpense.extraExpenseOrderNumber"
                class="py-2"
                dense
                :error-messages="errors"
                label="數量"
                min="1"
                type="number"
              />
            </ValidationProvider>
            <ValidationProvider
              v-slot="{ errors }"
              name="備註"
              rules="max:300"
            >
              <v-textarea
                v-model="tempExtraExpense.extraExpenseOrderNote"
                auto-grow
                class="py-2"
                dense
                :error-messages="errors"
                label="備註"
                row-height="20"
                rows="4"
              />
            </ValidationProvider>
            <div class="d-flex align-center">
              <v-spacer />
              <v-btn
                color="info"
                depressed
                small
                @click="insertExtraExpenseOrder"
              >
                完成
              </v-btn>
            </div>
          </v-card-text>
        </form>
      </ValidationObserver>
    </v-card>
  </v-dialog>
</template>
