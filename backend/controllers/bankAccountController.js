import { BankAccount } from '../models/BankAccount.js';
import { getNextSequence } from '../models/Counter.js';

export const getBankAccounts = async (req, res, next) => {
  try {
    const isAdmin = req.user && (req.user.role === 1 || req.user.role === 'Admin');
    const query = isAdmin ? {} : { isActive: true };

    const accounts = await BankAccount.find(query).sort({ isDefault: -1, id: 1 }).lean();

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getBankAccountById = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({ id: Number(req.params.id) }).lean();
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản ngân hàng.' });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

export const createBankAccount = async (req, res, next) => {
  try {
    const { bankCode, bankName, accountNumber, accountName, branch, isDefault, isActive, notes } = req.body;

    if (!bankCode || !bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: Mã ngân hàng, Tên ngân hàng, Số tài khoản và Tên chủ tài khoản.',
      });
    }

    const totalAccounts = await BankAccount.countDocuments();
    const shouldBeDefault = Boolean(isDefault) || totalAccounts === 0;

    if (shouldBeDefault) {
      await BankAccount.updateMany({}, { $set: { isDefault: false } });
    }

    const id = await getNextSequence('bank_account_id');
    const account = await BankAccount.create({
      id,
      bankCode: bankCode.trim().toUpperCase(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim().toUpperCase(),
      branch: branch?.trim() || null,
      isDefault: shouldBeDefault,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      notes: notes?.trim() || null,
    });

    res.status(201).json({
      success: true,
      message: 'Thêm tài khoản ngân hàng thành công',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBankAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({ id: Number(req.params.id) });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản ngân hàng.' });
    }

    const { bankCode, bankName, accountNumber, accountName, branch, isDefault, isActive, notes } = req.body;

    if (bankCode) account.bankCode = bankCode.trim().toUpperCase();
    if (bankName) account.bankName = bankName.trim();
    if (accountNumber) account.accountNumber = accountNumber.trim();
    if (accountName) account.accountName = accountName.trim().toUpperCase();
    if (branch !== undefined) account.branch = branch ? branch.trim() : null;
    if (notes !== undefined) account.notes = notes ? notes.trim() : null;
    if (isActive !== undefined) account.isActive = Boolean(isActive);

    if (isDefault) {
      await BankAccount.updateMany({ id: { $ne: account.id } }, { $set: { isDefault: false } });
      account.isDefault = true;
      account.isActive = true;
    }

    await account.save();

    res.json({
      success: true,
      message: 'Cập nhật tài khoản ngân hàng thành công',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultBankAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({ id: Number(req.params.id) });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản ngân hàng.' });
    }

    await BankAccount.updateMany({}, { $set: { isDefault: false } });
    account.isDefault = true;
    account.isActive = true;
    await account.save();

    res.json({
      success: true,
      message: `Đã đặt ${account.bankName} - ${account.accountNumber} làm tài khoản nhận tiền chính`,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBankAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({ id: Number(req.params.id) });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản ngân hàng.' });
    }

    const totalCount = await BankAccount.countDocuments();
    if (totalCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Hệ thống cần ít nhất một tài khoản ngân hàng để sinh mã thanh toán QR. Không thể xóa.',
      });
    }

    const wasDefault = account.isDefault;
    await BankAccount.deleteOne({ id: account.id });

    if (wasDefault) {
      const remaining = await BankAccount.findOne().sort({ id: 1 });
      if (remaining) {
        remaining.isDefault = true;
        remaining.isActive = true;
        await remaining.save();
      }
    }

    res.json({
      success: true,
      message: 'Đã xóa tài khoản ngân hàng thành công',
    });
  } catch (error) {
    next(error);
  }
};
